import logging
import json
from typing import Any, List, Union

from mitmproxy.contentviews._api import Contentview
from mitmproxy import contentviews
from mitmproxy.http import Request

DEFAULT_INDENT = 0


def multi_line_splitter(line: int) -> str:
    # 生成line个'\n-'
    return "\n " * line + "\n"


def format_content(content: Union[str, List[Any]]) -> str:
    """格式化content内容，处理字符串和对象数组的情况"""
    if not content:
        return ""

    # 如果是字符串，直接返回
    if isinstance(content, str):
        return content.strip()

    # 如果是列表，需要处理每个对象
    if isinstance(content, list):
        result_parts = []
        for item in content:
            if isinstance(item, str):
                result_parts.append(item)
            elif isinstance(item, dict):
                # 检查type属性
                item_type = item.get("type", "")
                if item_type == "text":
                    # 处理文本类型
                    text_content = item.get("text", "")
                    if isinstance(text_content, str):
                        result_parts.append(text_content)
                    elif isinstance(text_content, dict):
                        # 如果text_content是一个对象，包含value和annotations字段
                        value = text_content.get("value", "")
                        annotations = text_content.get("annotations", [])
                        result_parts.append(value)
                        # 如果需要显示annotations，可以添加到结果中
                        if annotations:
                            result_parts.append(f"[annotations: {json.dumps(annotations, ensure_ascii=False)}]")
                else:
                    # 其他类型的对象，直接转为JSON字符串
                    result_parts.append(json.dumps(item, ensure_ascii=False))
            else:
                # 其他类型，转为字符串
                result_parts.append(str(item))
        return "\n---\n".join(result_parts)

    # 其他情况，转为字符串
    return str(content)


def indent_text(text: str, n: int) -> str:
    """将多行文本整体缩进 n 个空格"""
    if not text:
        return text
    indent = " " * n
    indented_lines = [
        (indent + line) if line.strip() else line for line in text.splitlines()
    ]
    return "\n".join(indented_lines)


def format_json_text(text: str) -> str:
    """将JSON文本格式化为markdown代码块"""
    if not text:
        return text
    # 尝试解析JSON并美化
    try:
        parsed_json = json.loads(text)
        formatted_json = json.dumps(parsed_json, indent=2, ensure_ascii=False)
        return f"```json\n{formatted_json}\n```"
    except json.JSONDecodeError:
        # 如果不是有效的JSON，则保持原样
        return text


split_line = "\n----------------------------------\n"


def handle_request_basis(body: Any) -> str:
    """处理请求的基础信息: model,temperature,stream,max_tokens,messages.length,tools.length"""
    basic_result = ""
    model = body.get("model", "N/A")
    temperature = body.get("temperature", "N/A")
    stream = body.get("stream", "N/A")
    max_tokens = body.get("max_tokens", "N/A")
    messages_length = len(body.get("messages", []))
    tools_length = len(body.get("tools", []))
    # 计算所有标签的最大长度，实现右对齐
    labels = ["model", "temperature", "stream", "max_tokens", "messages", "tools"]
    max_label_len = max(len(label) for label in labels) + 2
    basic_result += f'{"model":<{max_label_len}}:   {model}\n'
    basic_result += f'{"temperature":<{max_label_len}}:   {temperature}\n'
    basic_result += f'{"stream":<{max_label_len}}:   {stream}\n'
    basic_result += f'{"max_tokens":<{max_label_len}}:   {max_tokens}\n'
    basic_result += f'{"messages":<{max_label_len}}:   {messages_length}\n'
    basic_result += f'{"tools":<{max_label_len}}:   {tools_length}\n'
    return basic_result


def handle_messages(messages: List[Any]) -> str:
    prompt_result = f"## Messages📖 ({len(messages)})\n"
    for i, message in enumerate(messages):
        role = message.get("role")
        raw_content = message.get("content", "")
        content = format_content(raw_content)
        tool_calls = message.get("tool_calls", [])
        tool_call_id = message.get("tool_call_id", "")
        # logging.info(f'🔍[{i}] role: {role}, content: {content}')
        prompt_result += f"### 📋{i} [role: {role}]\n"

        # 如果是工具消息，显示 tool_call_id
        if role == "tool" and tool_call_id:
            prompt_result += f"  - Tool Call ID: {tool_call_id}\n"

        if content:
            prompt_result += f"#### 💬Content\n{split_line}{content}{split_line}"

        # 处理工具调用
        if tool_calls:
            prompt_result += f"#### 🔨Tool Calls ({len(tool_calls)})\n"
            for j, tool_call in enumerate(tool_calls):
                tool_id = tool_call.get("id", "N/A")
                tool_type = tool_call.get("type", "N/A")
                function = tool_call.get("function", {})
                function_name = function.get("name", "N/A")
                arguments = function.get("arguments", "{}")

                prompt_result += f"##### Tool Call {j}\n"
                prompt_result += f"  - ID      : {tool_id}\n"
                prompt_result += f"  - Type    : {tool_type}\n"
                prompt_result += f"  - Function: {function_name}\n"
                prompt_result += f"  - Arguments: {split_line}{format_json_text(arguments)}{split_line}\n"
    return prompt_result


def handle_tools(tools: List[Any]):
    tool_result = f"## Tools🛠️ ({len(tools)})\n"
    for i, tool in enumerate(tools):
        tool_name = tool["function"]["name"]
        tool_desc = tool["function"]["description"]
        tool_params = tool["function"].get("parameters", {})

        tool_result += (
            f"### 🛠️{i}: {tool_name}\n{split_line}{indent_text(tool_desc, DEFAULT_INDENT)}{split_line}"
        )

        # Add parameters if they exist
        if tool_params:
            tool_result += f"#### Parameters:\n"
            # Convert parameters to JSON string with indentation for better readability
            params_json = json.dumps(tool_params, indent=2, ensure_ascii=False)
            tool_result += f"{split_line}{format_json_text(params_json)}{split_line}\n"
    return tool_result


class OpenaiReq(Contentview):
    name = "openai-request"
    syntax_highlight = "none"

    def prettify(
        self,
        data: bytes,
        metadata: contentviews.Metadata,
    ) -> str:
        try:
            return self.prettify_exec(data, metadata)
        except Exception as e:
            logging.error(f"Error in OpenaiReq prettify: {e}")
            return f"Error processing request: {e}"

    def prettify_exec(
        self,
        data: bytes,
        metadata: contentviews.Metadata,
    ) -> str:

        # logging.info('prettify LLM Request body')
        obj = json.loads(data)

        result = "# LLM Request body\n \n"
        result += handle_request_basis(obj)
        result += multi_line_splitter(2)
        # print(obj['messages'])
        result += handle_messages(obj.get("messages", []))
        result += multi_line_splitter(3)
        result += handle_tools(obj.get("tools", []))

        return result

    def render_priority(self, data: bytes, metadata: contentviews.Metadata) -> float:
        if (
            metadata.content_type
            and metadata.content_type.startswith("application/")
            and metadata.content_type.endswith("json")
            and metadata.flow.request.path.endswith("completions")
            and isinstance(metadata.http_message, Request)
        ):
            return 2  # return a value > 1 to make sure the custom view is automatically selected
        else:
            return 0


contentviews.add(OpenaiReq)