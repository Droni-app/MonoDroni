import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import '@dronico/droni-kit/dist/droni-kit.css'
import './assets/main.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')
  const siteId = localStorage.getItem('site_id')
  if (to.path === '/oauth/callback') return
  if (!token) return to.path === '/login' ? undefined : '/login'
  if (!siteId) return to.path === '/sites' ? undefined : '/sites'
  if (to.path === '/login' || to.path === '/sites') return '/'
})

createApp(App).use(router).mount('#app')
