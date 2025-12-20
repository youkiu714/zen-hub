import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


export default defineConfig({
  base: '/', // 部署到根目录，如果是子目录请改为 '/子目录名/'
  build: {
    chunkSizeWarningLimit: 2000
  },
    css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
@use "@/styles/element/index.scss" as element;
@use "@/styles/variables.scss" as *;
`,
        api: 'modern', // 👈 关键：启用 modern Sass API
      },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/lodging/api': {
        target: 'http://49.232.241.94:8080/lodging',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lodging\/api/, '/api')
      }
    }
  }
})