import { createApp } from 'vue'
import { createPinia } from 'pinia'
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

// Khmer locale for PrimeVue Calendar
const khmerLocale = {
  firstDayOfWeek: 0,
  dayNames: ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
  dayNamesShort: ['អា.ទិ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រ.ហ', 'សុក្រ', 'សៅរ៍'],
  dayNamesMin: ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'],
  monthNames: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
  monthNamesShort: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
  today: 'ថ្ងៃនេះ',
  clear: 'សម្អាត',
  dateFormat: 'dd/mm/yy',
  weekHeader: 'សប្តាហ៍'
};

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  locale: khmerLocale
})
app.use(ToastService)
app.mount('#app')
