import { challenges } from '~/server/utils/codelab'

export default defineEventHandler(() => {
  return challenges.find(c => c.slug === 'encontrar-maximo')
})
