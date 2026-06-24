import { challenges } from '~/server/utils/codelab'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = query.search ? String(query.search).toLowerCase() : ''
  const level = query.level ? Number(query.level) : null

  const filtered = challenges.filter(c => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search)
    const matchesLevel = !level || c.level === level
    return matchesSearch && matchesLevel
  })

  const perPage = query.perPage ? Number(query.perPage) : 12
  const page = query.page ? Number(query.page) : 1
  const start = (page - 1) * perPage
  const end = start + perPage
  const paginated = filtered.slice(start, end).map(({ tests, ...meta }) => meta)

  return {
    data: paginated,
    current_page: page,
    from: filtered.length ? start + 1 : 0,
    last_page: Math.ceil(filtered.length / perPage) || 1,
    per_page: perPage,
    to: Math.min(end, filtered.length),
    total: filtered.length,
  }
})
