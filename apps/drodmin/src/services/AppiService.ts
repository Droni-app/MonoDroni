import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  throw new Error('VITE_API_URL is not defined. Check your .env file.')
}

const AppiService = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const SESSION_KEYS = { token: 'auth_token', siteId: 'site_id', user: 'auth_user' }

AppiService.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_KEYS.token)
  const siteId = localStorage.getItem(SESSION_KEYS.siteId)
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (siteId) config.headers['x-site-id'] = siteId
  return config
})

// Tokens expire, and appi can revoke them: that ends the session, not just this request.
// A full reload also resets the session state useAuth keeps in memory
AppiService.interceptors.response.use(undefined, (error) => {
  const isOauthRequest = error.config?.url?.startsWith('/oauth/')
  if (error.response?.status === 401 && !isOauthRequest) {
    Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key))
    window.location.assign('/login')
  }
  return Promise.reject(error)
})

// Extracts a readable message from an appi error: `{ message }` for regular errors,
// `{ errors: [{ message }] }` for VineJS validation (422) errors.
export function apiError(e: any, fallback: string): string {
  const data = e?.response?.data
  return data?.message ?? data?.errors?.[0]?.message ?? fallback
}

export default AppiService
