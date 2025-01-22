
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from '@/stores/index'
import '@/styles/index.less'
/* Store */
import { createPinia } from 'pinia'
import { setGlobalOptions } from 'vue-request'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

import 'remixicon/fonts/remixicon.css'

import 'virtual:svg-icons-register' // 必须引入
// import SvgIcon from '@/components/SvgIcon/SvgIcon.vue'

const app = createApp(App)

// 全局配置vue-request
setGlobalOptions({
  manual: true,
  debounceInterval: 200,
  debounceOptions: {
    leading: true,
  },
})


app.use(createPinia())
app.use(router)
app.use(store)

app.mount('#app')
