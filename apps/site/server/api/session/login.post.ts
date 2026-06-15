import { setAppiToken } from '../../utils/appi_session'

type LoginBody = {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody<LoginBody>(event)

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  let data: Login

  try {
    data = await $fetch<Login>(`${runtimeConfig.appi}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-site-id': String(runtimeConfig.appiSiteId),
      },
      body: {
        email: body.email,
        password: body.password,
      },
    })
  } catch (e: any) {
    const firstError = e?.data?.errors?.[0]?.message
    const apiMessage = firstError ?? e?.data?.message ?? 'Invalid user credentials'
    throw createError({
      statusCode: e?.statusCode ?? 400,
      statusMessage: apiMessage,
      data: e?.data,
    })
  }

  if (!data.token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid login response from API',
    })
  }

  setAppiToken(event, data.token)

  return {
    user: data.user,
    enrollment: data.enrollment,
  }
})
