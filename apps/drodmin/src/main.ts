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
  const publicPaths = ['/login', '/oauth/google/callback']
  if (!token && !publicPaths.includes(to.path)) return '/login'
  if (token && to.path === '/login') return '/'
})

createApp(App).use(router).mount('#app')
