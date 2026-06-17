import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  const dataDir = join(process.cwd(), 'server/data/codelab/desafios')
  const filePath = join(dataDir, `${slug}.json`)
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const challenge = JSON.parse(content)
    return challenge
  } catch (error) {
    console.error(`Error reading challenge ${slug}:`, error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Challenge not found',
    })
  }
})
