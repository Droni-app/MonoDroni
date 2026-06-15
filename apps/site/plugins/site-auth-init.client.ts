export default defineNuxtPlugin(async () => {
  const auth = useSiteAuth()
  await auth.init()
})
