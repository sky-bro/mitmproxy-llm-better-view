# 更好地在 mitmproxy 中查看 LLM API（如 OpenAI Completion）的请求体和响应体

![对比图](./docs/compare-1.png)
![](https://raw.githubusercontent.com/slow-groovin/mitmproxy-llm-better-view/refs/heads/main/docs/mitm-better-view.webp)

[English README](README.md)

## 快速开始
本项目提供了两种工具 (**两种方式可同时使用**)：
1. mitmproxy addon 脚本，可在 mitmproxy 运行时通过参数添加
2. （仅支持 mitmweb）Tampermonkey 脚本

### 方式1：mitmproxy addon 脚本

```bash
git clone https://github.com/slow-groovin/mitmproxy-llm-better-view.git
```

在 `~/.mitmproxy/config.yaml` 中添加持久化配置：

```yaml
# ... 你的其他配置
scripts:
  - <目录路径>\addon\openai_req.py
  - <目录路径>\addon\openai_res.py
  - <目录路径>\addon\openai_res_sse.py
```

> 你也可以在启动时通过 `-s` 参数指定脚本：
> `mitmweb -s .\openai_req.py -s .\openai_res.py -s .\openai_res_sse.py`

### 方式2：Tampermonkey 脚本

1. 浏览器安装了好tampermonkey插件
2. 通过浏览器打开[mitmweb-llm-better-view.user.js](https://raw.githubusercontent.com/sky-bro/mitmproxy-llm-better-view/refs/heads/main/tampermonkey-script/dist/mitmweb-llm-better-view.user.js)来安装tampermonkey脚本 

## 工作原理
### 方式1：mitmproxy addon 脚本

本工具利用 mitmproxy 的 [contentviews](https://docs.mitmproxy.org/stable/addons/contentviews/) ，将 openai api 的请求体和响应内容转换为 Markdown 格式进行展示。

### 方式2：Tampermonkey 脚本

通过 JS 在页面内获取数据并渲染为静态 HTML，然后通过 iframe 嵌入页面显示。
