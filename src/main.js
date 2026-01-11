import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import './assets/common.css'
import './styles/darkmode.css'
import './styles/primevue.css'

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.mount('#app')
