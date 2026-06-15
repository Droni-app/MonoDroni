type RegisterBody = {
  fullName?: string
  email?: string
  password?: string
  passwordConfirmation?: string
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody<RegisterBody>(event)

  if (!body?.fullName || !body?.email || !body?.password || !body?.passwordConfirmation) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All fields are required',
    })
  }

  const data = await $fetch(`${runtimeConfig.appi}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-site-id': String(runtimeConfig.appiSiteId),
    },
    body: {
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      passwordConfirmation: body.passwordConfirmation,
    },
  })

  return data
})
