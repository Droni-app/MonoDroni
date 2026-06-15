import { ref, computed } from 'vue'
import AppiService from '../services/AppiService'
import type { AuthUser } from '../types/AppiService'

export type { AuthUser }

const TOKEN_KEY = 'auth_token'
const SITE_ID_KEY = 'site_id'
const USER_KEY = 'auth_user'
const ALLOWED_ROLES = ['owner', 'admin', 'editor']
const appUrl = import.meta.env.VITE_APP_URL


const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const siteId = ref<string | null>(localStorage.getItem(SITE_ID_KEY))
const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'))

function saveSession(data: any, site?: string) {
  const role = data.enrollment?.role
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error('No tienes permisos para acceder a este panel.')
  }
  token.value = data.token
  localStorage.setItem(TOKEN_KEY, data.token)
  if (data.user) {
    const u: AuthUser = {
      id: data.user.id ?? '',
      fullName: data.user.fullName ?? data.user.email ?? '',
      email: data.user.email ?? '',
      avatar: data.user.avatar ?? data.user.picture ?? null,
    }
    user.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }
  if (site) {
    siteId.value = site
    localStorage.setItem(SITE_ID_KEY, site)
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  function getGoogleCallbackUrl() {
    return `${appUrl}/oauth/google/callback`
  }

  async function login(email: string, password: string, site: string) {
    const { data } = await AppiService.post('/auth/login', { email, password }, {
      headers: { 'x-site-id': site },
    })
    saveSession(data, site)
  }

  async function loginWithGoogle(site: string) {
    localStorage.setItem(SITE_ID_KEY, site)
    siteId.value = site
    const { data } = await AppiService.get('/auth/google/url', {
      params: {
        callbackUrl: getGoogleCallbackUrl(),
      },
      headers: { 'x-site-id': site },
    })
    window.location.href = data.url
  }

  async function handleGoogleCallback(code: string) {
    const { data } = await AppiService.get('/auth/google/handle', {
      params: {
        code,
        callbackUrl: getGoogleCallbackUrl(),
      },
    })
    saveSession(data)
  }

  function logout() {
    token.value = null
    siteId.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SITE_ID_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, siteId, user, isAuthenticated, login, loginWithGoogle, handleGoogleCallback, logout }
}
