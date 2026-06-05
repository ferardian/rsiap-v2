import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/css/main.css'

import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { QuillEditor, Quill } from '@vueup/vue-quill'
import Table from 'quill/modules/table'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

Quill.register({
  'modules/table': Table
}, true)

const app = createApp(App)

app.component('QuillEditor', QuillEditor)

app.component('v-select', vSelect)
app.use(createPinia())
app.use(router)
app.use(Toast, {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
})

app.mount('#app')