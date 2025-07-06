import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index'
import './assets/css/style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createMetaManager } from 'vue-meta'
import axios from 'axios'

import { createPinia } from 'pinia'

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.timeout = 30000

// 引入AOS动画库
import AOS from 'aos'
import 'aos/dist/aos.css'
// 注释掉单独导入的ElCollapseTransition，因为ElementPlus已经包含它
// import { ElCollapseTransition } from 'element-plus'
// Vue.config.productionTip = false;


// 初始化AOS
AOS.init({

  duration: 800,
  easing: 'ease-in-out',
  once: true,
  offset: 100
})

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// 初始化用户状态
import { useUserStore } from './stores/user'
const userStore = useUserStore(pinia)
// 从本地存储加载用户信息
const userInfo = localStorage.getItem('user')
if (userInfo) {
  try {
    const user = JSON.parse(userInfo)
    userStore.setUser({
      username: user.username,
      name: user.name,
      id: user.userId,
      role: user.role
    })
    console.log('已从本地存储恢复用户状态')
  } catch (e) {
    console.error('解析用户信息失败', e)
  }
}

const metaManager = createMetaManager()
app.use(metaManager)

// 注释掉单独注册ElCollapseTransition组件的行，因为ElementPlus包已经注册它
// app.component(ElCollapseTransition.name, ElCollapseTransition)
app.use(router)
app.use(ElementPlus)


// 全局挂载axios
app.config.globalProperties.$axios = axios

// 添加环境变量日志，帮助调试
console.log('当前环境:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);

app.mount('#app')





