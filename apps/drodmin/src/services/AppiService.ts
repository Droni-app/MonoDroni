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

AppiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  const siteId = localStorage.getItem('site_id')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (siteId) config.headers['x-site-id'] = siteId
  return config
})

export default AppiService
