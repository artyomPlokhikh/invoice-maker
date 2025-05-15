import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { Buffer } from 'buffer';

import App from './App.vue'
import router from './router/index.js'

window.Buffer = Buffer;

const app = createApp(App)
app.use(createPinia().use(createPersistedState()))
app.use(router)

app.mount('#app')
