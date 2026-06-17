import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  const dataDir = join(process.cwd(), 'server/data/codelab/desafios')
  const filePath = join(dataDir, `${slug}.json`)
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const challenge = JSON.parse(content)
    
    // Retornar solo los tests
    return challenge.tests || []
  } catch (error) {
    console.error(`Error reading tests for challenge ${slug}:`, error)
    return []
  }
})
