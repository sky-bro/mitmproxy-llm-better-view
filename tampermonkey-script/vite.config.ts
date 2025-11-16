import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: {
          "": 'mitmproxy-llm-better-view',
          "zh-CN": "mitmproxy 大模型请求内容预览"
        },
        icon: 'https://s3.api2o.com/mitm-better-view.svg',
        description: {
          "": 'Better view request body and response body of LLM API (openai completion) in mitmweb',
          "zh-CN": "在 mitmweb 中查看大模型请求中的信息 "
        },
        homepage: 'https://github.com/sky-bro/mitmproxy-llm-better-view',
        updateURL: 'https://raw.githubusercontent.com/sky-bro/mitmproxy-llm-better-view/refs/heads/main/tampermonkey-script/dist/mitmweb-llm-better-view.user.js',
        downloadURL: 'https://raw.githubusercontent.com/sky-bro/mitmproxy-llm-better-view/refs/heads/main/tampermonkey-script/dist/mitmweb-llm-better-view.user.js',
        namespace: "npm/vite-plugin-monkey",
        include: [
          "http://localhost:8081/*",
          "http://127.0.0.1:8081/*"
        ],
      },
      build: {
        fileName: "mitmweb-llm-better-view.user.js",
      },
    }),
  ],
});
