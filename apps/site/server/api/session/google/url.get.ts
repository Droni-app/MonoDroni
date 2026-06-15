export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const callbackUrl = `${String(runtimeConfig.appUrl)}/oauth/google/callback`

  try {
    return await $fetch<{ url: string }>(`${runtimeConfig.appi}/auth/google/url`, {
      query: {
        callbackUrl,
      },
      headers: {
        'Content-Type': 'application/json',
        'x-site-id': String(runtimeConfig.appiSiteId),
      },
    })
  } catch (e: any) {
    const firstError = e?.data?.errors?.[0]?.message
    const apiMessage = firstError ?? e?.data?.message ?? 'Could not start Google login'
    throw createError({
      statusCode: e?.statusCode ?? 400,
      statusMessage: apiMessage,
      data: e?.data,
    })
  }
})
