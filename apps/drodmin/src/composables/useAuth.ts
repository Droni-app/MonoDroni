import { ref, computed } from 'vue'
import AppiService, { SESSION_KEYS } from '../services/AppiService'
import type { AuthUser, UserSite } from '../types/AppiService'

export type { AuthUser, UserSite }

const OAUTH_FLOW_KEY = 'oauth_flow'
// The only site role appi's admin routes accept (adminSite middleware)
const PANEL_ROLE = 'owner'
const apiUrl = import.meta.env.VITE_API_URL
const appUrl = import.meta.env.VITE_APP_URL
const clientId = import.meta.env.VITE_APPI_OAUTH_CLIENT_ID

const token = ref<string | null>(localStorage.getItem(SESSION_KEYS.token))
const siteId = ref<string | null>(localStorage.getItem(SESSION_KEYS.siteId))
const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem(SESSION_KEYS.user) ?? 'null'))
const sites = ref<UserSite[]>([])

// Requests read the session from localStorage, so after a change in another tab this one
// would keep showing a site while writing to a different one
window.addEventListener('storage', (event) => {
  if (event.key === SESSION_KEYS.siteId || event.key === SESSION_KEYS.token) {
    window.location.assign('/')
  }
})

function base64Url(bytes: ArrayBuffer | Uint8Array) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString() {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)))
}

function callbackUrl() {
  return `${appUrl.replace(/\/+$/, '')}/oauth/callback`
}

/** A flow can only be completed once, whatever its outcome. */
function consumeFlow(): { state: string; verifier: string } | null {
  const value = sessionStorage.getItem(OAUTH_FLOW_KEY)
  sessionStorage.removeItem(OAUTH_FLOW_KEY)
  return value ? JSON.parse(value) : null
}

function clearSite() {
  siteId.value = null
  user.value = null
  localStorage.removeItem(SESSION_KEYS.siteId)
  localStorage.removeItem(SESSION_KEYS.user)
}

function clearSession() {
  token.value = null
  sites.value = []
  localStorage.removeItem(SESSION_KEYS.token)
  clearSite()
}

export function useAuth() {
  // Without a site the panel can't show anything yet: the app stays on the site picker
  const isAuthenticated = computed(() => !!token.value && !!siteId.value)
  const currentSite = computed(() =>
    sites.value.find((enrollment) => enrollment.siteId === siteId.value)
  )

  /** Sends the user to appi, where login, signup and password recovery live. */
  async function login() {
    if (!clientId) {
      throw new Error('VITE_APPI_OAUTH_CLIENT_ID no está configurado.')
    }
    const state = randomString()
    const verifier = randomString()
    const challenge = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    sessionStorage.setItem(OAUTH_FLOW_KEY, JSON.stringify({ state, verifier }))

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl(),
      state,
      code_challenge: base64Url(challenge),
      code_challenge_method: 'S256',
    })
    window.location.assign(`${apiUrl.replace(/\/+$/, '')}/oauth/authorize?${params}`)
  }

  /**
   * Completes the flow from appi's redirect. Returns false if the user went back from
   * appi's page without logging in, which isn't an error.
   */
  async function handleOauthCallback(query: Record<string, unknown>) {
    const flow = consumeFlow()
    if (!flow || query.state !== flow.state) {
      throw new Error('La sesión de inicio expiró. Vuelve a intentarlo.')
    }
    if (query.error === 'access_denied') {
      return false
    }
    if (query.error || typeof query.code !== 'string') {
      throw new Error('No se pudo iniciar sesión. Vuelve a intentarlo.')
    }

    const { data } = await AppiService.post(
      '/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: String(clientId),
        code: query.code,
        code_verifier: flow.verifier,
        redirect_uri: callbackUrl(),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    clearSite()
    token.value = data.access_token
    localStorage.setItem(SESSION_KEYS.token, data.access_token)
    return true
  }

  /** The sites this user can manage from the panel. */
  async function loadSites() {
    const { data } = await AppiService.get<UserSite[]>('/auth/sites')
    sites.value = data.filter((enrollment) => enrollment.role === PANEL_ROLE)
    return sites.value
  }

  async function selectSite(id: string) {
    const previous = localStorage.getItem(SESSION_KEYS.siteId)
    localStorage.setItem(SESSION_KEYS.siteId, id)
    try {
      const { data } = await AppiService.get('/auth/me')
      const profile: AuthUser = {
        id: data.user.id,
        fullName: data.user.fullName ?? data.user.email,
        email: data.user.email,
        avatar: data.user.avatar ?? null,
      }
      user.value = profile
      localStorage.setItem(SESSION_KEYS.user, JSON.stringify(profile))
      siteId.value = id
    } catch (e) {
      if (previous) {
        localStorage.setItem(SESSION_KEYS.siteId, previous)
      } else {
        localStorage.removeItem(SESSION_KEYS.siteId)
      }
      throw e
    }
  }

  async function logout() {
    try {
      await AppiService.post('/auth/logout')
    } catch {
      // The session ends here anyway; an unrevoked token expires on its own
    }
    clearSession()
  }

  return {
    token,
    siteId,
    user,
    sites,
    currentSite,
    isAuthenticated,
    login,
    handleOauthCallback,
    loadSites,
    selectSite,
    logout,
  }
}
