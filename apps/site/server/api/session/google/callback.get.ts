import { setAppiToken } from '../../../utils/appi_session'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : null
  const callbackUrl = `${String(runtimeConfig.appUrl)}/oauth/google/callback`

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Google authorization code is required',
    })
  }

  let data: Login

  try {
    data = await $fetch<Login>(`${runtimeConfig.appi}/auth/google/handle`, {
      query: {
        code,
        callbackUrl,
      },
      headers: {
        'Content-Type': 'application/json',
        'x-site-id': String(runtimeConfig.appiSiteId),
      },
    })
  } catch (e: any) {
    const firstError = e?.data?.errors?.[0]?.message
    const apiMessage = firstError ?? e?.data?.message ?? 'Google login failed'
    throw createError({
      statusCode: e?.statusCode ?? 400,
      statusMessage: apiMessage,
      data: e?.data,
    })
  }

  if (!data.token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Google login response from API',
    })
  }

  setAppiToken(event, data.token)

  return {
    user: data.user,
    enrollment: data.enrollment,
  }
})
