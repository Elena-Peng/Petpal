import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 部署在服务器的 /petpal/ 子路径下，构建产物资源路径统一加前缀
  base: '/petpal/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
