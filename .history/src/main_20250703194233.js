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

const metaManager = createMetaManager()
app.use(metaManager)

// 注释掉单独注册ElCollapseTransition组件的行，因为ElementPlus包已经注册它
// app.component(ElCollapseTransition.name, ElCollapseTransition)
app.use(router)
app.use(ElementPlus)

<<<<<<< HEAD
// 全局挂载axios
app.config.globalProperties.$axios = axios
=======
// 添加环境变量日志，帮助调试
console.log('当前环境:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);
>>>>>>> 172193e (学生课程与学生个人中心)

app.mount('#app')





