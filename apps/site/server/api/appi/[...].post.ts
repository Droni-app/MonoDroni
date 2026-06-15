import { getAppiToken } from '../../utils/appi_session'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = getAppiToken(event)
  const endpoint = String(event.node.req.url).replace('/api/appi', '')
  const body = await readBody(event)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-site-id': String(runtimeConfig.appiSiteId),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await $fetch(`${runtimeConfig.appi}${endpoint}`, {
    method: 'POST',
    headers,
    body,
  })
  return res
})