import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = await getToken({event})
  const appiToken = `Bearer ${token?.accessToken as AppiToken}`
  const endpoint = String(event.node.req.url).replace('/api/appi', '')

  
  const res = await $fetch(`${runtimeConfig.appi}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'site': runtimeConfig.appiSiteId,
      'Accept': 'application/json',
      'Authorization': appiToken
    }
  })
  return res
})
