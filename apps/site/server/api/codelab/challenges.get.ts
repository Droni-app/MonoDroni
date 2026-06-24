import { readdir } from 'fs/promises'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const dataDir = join(process.cwd(), 'server/data/codelab/desafios')
  
  try {
    const files = await readdir(dataDir)
    const jsonFiles = files.filter(f => f.endsWith('.json'))
    
    const challenges = []
    for (const file of jsonFiles) {
      const filePath = join(dataDir, file)
      const content = readFileSync(filePath, 'utf-8')
      const challenge = JSON.parse(content)
      // Excluir tests del listado (solo metadata)
      const { tests, ...metadata } = challenge
      challenges.push(metadata)
    }
    
    // Aplicar filtros
    const query = getQuery(event)
    const search = query.search ? String(query.search).toLowerCase() : ''
    const level = query.level ? Number(query.level) : null
    
    const filteredChallenges = challenges.filter(challenge => {
      const matchesSearch = !search || 
        challenge.name.toLowerCase().includes(search) ||
        challenge.description.toLowerCase().includes(search)
      
      const matchesLevel = !level || challenge.level === level
      
      return matchesSearch && matchesLevel
    })
    
    // Simular paginación
    const perPage = query.perPage ? Number(query.perPage) : 12
    const page = query.page ? Number(query.page) : 1
    const start = (page - 1) * perPage
    const end = start + perPage
    
    const paginatedChallenges = filteredChallenges.slice(start, end)
    
    return {
      data: paginatedChallenges,
      current_page: page,
      from: start + 1,
      last_page: Math.ceil(filteredChallenges.length / perPage),
      per_page: perPage,
      to: Math.min(end, filteredChallenges.length),
      total: filteredChallenges.length,
    }
  } catch (error) {
    console.error('Error reading challenges:', error)
    return {
      data: [],
      current_page: 1,
      from: 0,
      last_page: 1,
      per_page: 12,
      to: 0,
      total: 0,
    }
  }
})
