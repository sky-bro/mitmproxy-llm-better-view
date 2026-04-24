# 更好地在 mitmproxy 中查看 LLM API（如 OpenAI Completion）的请求体和响应体

![对比图](./docs/compare-1.png)
![](https://raw.githubusercontent.com/sky-bro/mitmproxy-llm-better-view/refs/heads/main/docs/mitm-better-view.webp)

[English README](README.md)

## 快速开始
本项目提供了两种工具 (**两种方式可同时使用**)：
1. mitmproxy addon 脚本，可在 mitmproxy 运行时通过参数添加
2. （仅支持 mitmweb）Tampermonkey 脚本

### 方式1：mitmproxy addon 脚本

```bash
git clone https://github.com/sky-bro/mitmproxy-llm-better-view.git
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

## 开发指南

### 环境要求

- [Node.js](https://nodejs.org/)（v18+）
- npm

### 初始化

```bash
git clone https://github.com/sky-bro/mitmproxy-llm-better-view.git
cd mitmproxy-llm-better-view/tampermonkey-script
npm install
```

### 开发模式

启动开发服务器（使用 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)）：

```bash
npm run dev
```

启动后在浏览器中打开终端输出的 URL，Tampermonkey 会提示安装一个开发版脚本，代码修改后会自动热重载。

脚本默认匹配 `http://localhost:8081/*`（mitmweb 默认端口），测试前请确保 mitmweb 已启动。

### 构建

```bash
npm run build
```

编译产物输出至 `dist/mitmweb-llm-better-view.user.js`。

### 项目结构

```text
tampermonkey-script/
├── src/
│   ├── main.tsx                     # 入口文件
│   └── components/
│       ├── openai/                  # OpenAI API 可视化组件
│       └── anthropic/               # Anthropic API 可视化组件
├── dist/
│   └── mitmweb-llm-better-view.user.js  # 构建产物
└── vite.config.ts                   # 构建配置（vite-plugin-monkey）
```

## 工作原理
### 方式1：mitmproxy addon 脚本

本工具利用 mitmproxy 的 [contentviews](https://docs.mitmproxy.org/stable/addons/contentviews/) ，将 openai api 的请求体和响应内容转换为 Markdown 格式进行展示。

### 方式2：Tampermonkey 脚本

通过 JS 在页面内获取数据并渲染，然后嵌入 mitmweb 界面显示。
