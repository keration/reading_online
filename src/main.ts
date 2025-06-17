import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as ElIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from '@/App.vue'
import router from '@/router'

// 初始化应用

const pinia = createPinia()
const app = createApp(App)
// 全局注册Element Plus图标
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component)
})

app.config.globalProperties.$formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}
// 配置Element Plus国际化
app.use(ElementPlus)
.use(router)
.use(pinia.use(piniaPluginPersistedstate))
   .mount('#app')

