import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { authService } from './modules/auth/auth.service'

async function init() {
  // Load current user with roles from BE when token exists (e.g. after refresh)
  if (localStorage.getItem('junhye.auth.token')) {
    await authService.fetchCurrentUser().catch(() => {})
  }
  createApp(App).use(router).mount('#app')
}
init()
