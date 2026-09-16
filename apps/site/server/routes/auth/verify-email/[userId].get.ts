export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const userId = getRouterParam(event, 'userId')

  if (!userId || !runtimeConfig.appi) {
    throw createError({ statusCode: 404, statusMessage: 'Verification route is unavailable' })
  }

  const appiUrl = String(runtimeConfig.appi).replace(/\/$/, '')
  const query = getRequestURL(event).search

  return sendRedirect(event, `${appiUrl}/auth/verify-email/${encodeURIComponent(userId)}${query}`, 301)
})