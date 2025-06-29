//import { createApp } from 'vue'
//import App from './App.vue'
//import router from './routes/index'
//import './assets/css/style.css'
//import ElementPlus from 'element-plus'
//import 'element-plus/dist/index.css'
//import { createMetaManager } from 'vue-meta'
//import { ElCollapseTransition } from 'element-plus'
// Vue.config.productionTip = false;

//const app = createApp(App)

//const metaManager = createMetaManager()
//app.use(metaManager)

//app.component(ElCollapseTransition.name, ElCollapseTransition)
//app.use(router)
//app.use(ElementPlus)
//app.mount('#app')



import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index'
import './assets/css/style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createMetaManager } from 'vue-meta'
import axios from 'axios'

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.timeout = 30000

const app = createApp(App)

const metaManager = createMetaManager()
app.use(metaManager)

// 注释掉单独注册ElCollapseTransition组件的行，因为ElementPlus包已经注册它
// app.component(ElCollapseTransition.name, ElCollapseTransition)
app.use(router)
app.use(ElementPlus)

// 全局挂载axios
app.config.globalProperties.$axios = axios

app.mount('#app')



