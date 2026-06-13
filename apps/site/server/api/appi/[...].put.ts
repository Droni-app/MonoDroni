import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = await getToken({event})
  const appiToken = `Bearer ${token?.accessToken as AppiToken}`
  const endpoint = String(event.node.req.url).replace('/api/appi', '')
  const body = await readBody(event)

  console.log('body', body)
  console.log('endpoint', endpoint)
  console.log('token', appiToken)
  
  const res = await $fetch(`${runtimeConfig.appi}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': appiToken,
      'site': runtimeConfig.appiSiteId,
    },
    body: body
  })
  return res
})