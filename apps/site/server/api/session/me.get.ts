import { getAppiToken } from '../../utils/appi_session'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = getAppiToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const data = await $fetch<Me>(`${runtimeConfig.appi}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      'x-site-id': String(runtimeConfig.appiSiteId),
      Authorization: `Bearer ${token}`,
    },
  })

  return data
})
