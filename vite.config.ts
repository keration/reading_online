import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'



export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 路径别名
      '~assets': path.resolve(__dirname, './src/assets'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', 
        // additionalData: `@use "@/styles/vars.scss" as *;`,
        // implementation: require('sass')
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
        
      }
    }
  }
})