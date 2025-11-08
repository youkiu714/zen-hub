import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import '@/styles/index.scss'
import { setupDirectives } from '@/directives'

// 开发环境工具
if (process.env.NODE_ENV === 'development') {
  import('@/utils/dev-tools')
  console.log('🚀 Vue应用启动完成 - 开发模式')
  console.log('📋 标签页功能状态: 已启用')
}

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 设置自定义指令
setupDirectives(app)

app.mount('#app')