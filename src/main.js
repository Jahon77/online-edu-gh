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

const metaManager = createMetaManager()
app.use(metaManager)

// 注释掉单独注册ElCollapseTransition组件的行，因为ElementPlus包已经注册它
// app.component(ElCollapseTransition.name, ElCollapseTransition)
app.use(router)
app.use(ElementPlus)
app.mount('#app')



