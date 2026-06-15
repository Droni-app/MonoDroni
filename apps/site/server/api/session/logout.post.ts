import { clearAppiToken, getAppiToken } from '../../utils/appi_session'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = getAppiToken(event)

  try {
    if (token) {
      await $fetch(`${runtimeConfig.appi}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-site-id': String(runtimeConfig.appiSiteId),
          Authorization: `Bearer ${token}`,
        },
      })
    }
  } finally {
    clearAppiToken(event)
  }

  return {
    message: 'Logged out successfully',
  }
})
