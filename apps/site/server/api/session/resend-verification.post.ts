type ResendVerificationBody = {
  email?: string
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody<ResendVerificationBody>(event)

  if (!body?.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  try {
    const data = await $fetch<{ message?: string }>(`${runtimeConfig.appi}/auth/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-site-id': String(runtimeConfig.appiSiteId),
      },
      body: {
        email: body.email,
      },
    })

    return {
      message: data?.message ?? 'Verification email sent. Please check your inbox.',
    }
  } catch (e: any) {
    const firstError = e?.data?.errors?.[0]?.message
    const apiMessage = firstError ?? e?.data?.message ?? 'Could not resend verification email'
    throw createError({
      statusCode: e?.statusCode ?? 400,
      statusMessage: apiMessage,
      data: e?.data,
    })
  }
})
