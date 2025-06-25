import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index'
import './assets/css/style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createMetaManager } from 'vue-meta'
import { ElCollapseTransition } from 'element-plus'
// Vue.config.productionTip = false;

const app = createApp(App)

const metaManager = createMetaManager()
app.use(metaManager)

app.component(ElCollapseTransition.name, ElCollapseTransition)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

