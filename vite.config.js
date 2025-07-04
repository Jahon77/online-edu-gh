import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 自动导入vue中hook reactive ref等
import AutoImport from "unplugin-auto-import/vite"
//自动导入ui-组件 比如说ant-design-vue  element-plus等
import Components from 'unplugin-vue-components/vite';
import ElementPlus from 'unplugin-element-plus/vite'
import { fileURLToPath, URL } from 'node:url'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 获取环境变量中的API URL，默认为本地开发地址
const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
			//安装两行后你会发现在组件中不用再导入ref，reactive等
			imports: ['vue', 'vue-router'],
            //存放的位置
			dts: "src/auto-import.d.ts",
      resolvers: [ElementPlusResolver()],

		}),
		Components({
			// 引入组件的,包括自定义组件
            // 存放的位置
            dts: "src/components.d.ts",
            resolvers: [ElementPlusResolver()],
		}),
    ElementPlus({
      // options
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'src': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [".js", ".ts", ".tsx", ".jsx"],
  },
  server: {
    proxy: {
           // 代理所有 /api 开头的请求到后端服务器
           '/api': {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
            // 不重写路径，保留/api前缀
            rewrite: (path) => path
          },
          // 代理验证码、登录等请求
          '/captcha': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/login': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/register': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/send-sms': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/check-phone': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/check-username': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false
          },
          '/ws': {
            target: 'ws://localhost:8080',
            ws: true,
            changeOrigin: true,
            secure: false
          }
    
      }
    }
  }
)


