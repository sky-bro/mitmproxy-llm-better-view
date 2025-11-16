import logging
import json
from typing import Any, List, Dict
import traceback

from mitmproxy.contentviews._api import Contentview
from mitmproxy import contentviews
from mitmproxy.http import Response


def parse_sse_data(data: bytes) -> List[Dict[str, Any]]:
    """解析SSE格式的数据流"""
    events = []
    text = data.decode("utf-8", errors="replace")
    logging.debug(f"SSE Raw Data:\n{text}")

    # 按行分割
    lines = text.split("\n")

    for line in lines:
        line = line.strip()
        if line.startswith("data:"):
            data_content = line[5:]

            if data_content == "[DONE]":
                continue

            try:
                json_data = json.loads(data_content)
                events.append(json_data)
            except json.JSONDecodeError:
                logging.warning(f"Could not decode SSE JSON data: {data_content}")
    return events


def merge_values(existing_value: Any, new_value: Any, path: List[str] = None) -> Any:
    """
    通用合并逻辑，根据值的类型进行不同的合并处理

    Args:
        existing_value: 已存在的值
        new_value: 新的值
        path: 当前路径，用于判断是否在delta上下文中

    Returns:
        合并后的值
    """
    if path is None:
        path = []

    # 如果新值为None，保留原值
    if new_value is None:
        return existing_value

    # 如果原值为None，使用新值
    if existing_value is None:
        return new_value

    # 字符串类型：根据上下文决定合并方式
    if isinstance(existing_value, str) and isinstance(new_value, str):
        # 检查路径中是否包含"delta"
        if any("delta" in key.lower() for key in path):
            # 在delta上下文中，使用字符串拼接
            return existing_value + new_value
        else:
            # 非delta上下文，选择非空值
            if existing_value != new_value and existing_value and new_value:
                # 如果两个值都不为空且不相等，记录警告
                logging.warning(f"Different string values found at path {path}: '{existing_value}' vs '{new_value}'. Using the existing value.")
            return existing_value if existing_value else new_value

    # 数组类型：根据index字段合并元素
    if isinstance(existing_value, list) and isinstance(new_value, list):
        # 创建一个以index为键的映射，只包含有index的元素
        existing_map = {}
        existing_no_index = []  # 存储没有index的元素
        for item in existing_value:
            if isinstance(item, dict) and "index" in item:
                existing_map[item["index"]] = item
            else:
                # 对于没有index的数组元素，直接添加到单独的列表中
                existing_no_index.append(item)
                if item is not None:  # 只对非None元素记录日志
                    logging.warning(f"Found array element without index field at path {path}: {item}")

        # 合并新数组中的元素
        new_no_index = []  # 存储新数组中没有index的元素
        for item in new_value:
            if isinstance(item, dict) and "index" in item:
                index = item["index"]
                if index in existing_map:
                    # 递归合并具有相同index的对象
                    existing_map[index] = merge_json_objects(existing_map[index], item, path)
                else:
                    existing_map[index] = item
            else:
                # 对于没有index的数组元素，直接添加到单独的列表中
                new_no_index.append(item)
                if item is not None:  # 只对非None元素记录日志
                    logging.warning(f"Found new array element without index field at path {path}: {item}")

        # 转换回列表并按index排序，然后添加没有index的元素
        merged_list = list(existing_map.values())
        if all(isinstance(item, dict) and "index" in item for item in merged_list):
            merged_list.sort(key=lambda x: x["index"])

        # 添加没有index的元素到末尾
        merged_list.extend(existing_no_index)
        merged_list.extend(new_no_index)

        return merged_list

    # 字典类型：递归合并
    if isinstance(existing_value, dict) and isinstance(new_value, dict):
        return merge_json_objects(existing_value, new_value, path)

    # 其他类型：直接覆盖
    return new_value


def merge_json_objects(existing_obj: Dict[str, Any], new_obj: Dict[str, Any], path: List[str] = None) -> Dict[str, Any]:
    """
    合并两个JSON对象

    Args:
        existing_obj: 已存在的对象
        new_obj: 新的对象
        path: 当前路径

    Returns:
        合并后的对象
    """
    if path is None:
        path = []

    result = existing_obj.copy()

    for key, value in new_obj.items():
        current_path = path + [key]
        if key in result:
            result[key] = merge_values(result[key], value, current_path)
        else:
            result[key] = value

    return result


def aggregate_sse_to_json(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    将SSE事件流聚合为单个JSON响应

    Args:
        events: 解析后的SSE事件列表

    Returns:
        聚合后的JSON对象
    """
    if not events:
        return {}

    # 从后往前查找最后一个包含 usage 信息的事件，作为基础信息来源
    final_event_for_meta = None
    for event in reversed(events):
        if "usage" in event and event["usage"] is not None:
            final_event_for_meta = event
            break
    # 如果没找到带 usage 的，就用最后一个事件作为兜底
    if not final_event_for_meta:
        final_event_for_meta = events[-1]

    # 创建聚合后的JSON对象，从最后一个事件开始
    aggregated_response = final_event_for_meta.copy()

    # 合并所有事件
    for event in events[:-1]:  # 不包括最后一个事件，因为它已经被用作基础
        aggregated_response = merge_json_objects(aggregated_response, event)

    return aggregated_response


class OpenaiRespJson(Contentview):
    name = "openai-json-response"
    syntax_highlight = "json"

    def prettify(
        self,
        data: bytes,
        metadata: contentviews.Metadata,
    ) -> str:
        try:
            return self.prettify_exec(data, metadata)
        except Exception as e:
            logging.error(f"Error prettifying response: {e}")
            traceback.print_exc()
            return f"Error during prettifying: {e}\n\n" + data.decode(
                "utf-8", errors="replace"
            )

    def prettify_exec(
        self,
        data: bytes,
        metadata: contentviews.Metadata,
    ) -> str:
        if not isinstance(metadata.http_message, Response):
            return f'"{self.name}" is for LLM Response'

        # 检查是否为SSE响应
        content_type = metadata.content_type or ""
        is_sse = "text/event-stream" in content_type

        if is_sse:
            # 处理SSE响应
            events = parse_sse_data(data)
            if not events:
                return "{}"

            # 聚合SSE事件为单个JSON
            aggregated_json = aggregate_sse_to_json(events)

            # 返回格式化的JSON字符串
            return json.dumps(aggregated_json, indent=2, ensure_ascii=False)
        else:
            # 处理普通JSON响应
            try:
                # 验证是否为有效的JSON
                obj = json.loads(data)
                # 返回格式化的JSON字符串
                return json.dumps(obj, indent=2, ensure_ascii=False)
            except json.JSONDecodeError as e:
                return f"Error decoding JSON: {e}\n\nRaw data:\n{data.decode('utf-8', errors='replace')}"

    def render_priority(self, data: bytes, metadata: contentviews.Metadata) -> float:
        # 检查是否为OpenAI响应
        is_openai_path = metadata.flow.request.path.endswith(
            "/chat/completions"
        ) or metadata.flow.request.path.endswith("/completions")

        if not isinstance(metadata.http_message, Response) or not is_openai_path:
            return 0

        content_type = metadata.content_type or ""
        is_json = content_type.startswith("application/") and content_type.endswith("json")
        is_sse = "text/event-stream" in content_type

        if is_json or is_sse:
            return 1.5  # 略低于专门的视图，但高于默认视图
        else:
            return 0

contentviews.add(OpenaiRespJson)
