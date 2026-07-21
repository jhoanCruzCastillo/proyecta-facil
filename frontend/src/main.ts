import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import router from './router'
import { useSessionStore } from './stores/session'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)

// Resuelve la sesión antes de montar: el guard de rutas en router/index.ts lee session.sesion de
// forma síncrona en la primera navegación, así que debe estar listo antes de app.mount().
await useSessionStore().restaurar()

app.mount('#app')
