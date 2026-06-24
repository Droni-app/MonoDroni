import { challenges } from '~/server/utils/codelab'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const challenge = challenges.find(c => c.slug === slug)
  return challenge?.tests ?? []
})
