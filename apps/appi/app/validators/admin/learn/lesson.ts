import vine from '@vinejs/vine'

export const storeLessonValidator = vine.create({
  name: vine.string(),
  description: vine.string().nullable().optional(),
  format: vine.enum(['text', 'html', 'markdown']).optional(),
  content: vine.string().nullable().optional(),
  activity: vine.string().nullable().optional(),
  video: vine.string().nullable().optional(),
  order: vine.number().optional(),
  active: vine.boolean().optional(),
  limit_date: vine.string().nullable().optional(),
})

export const updateLessonValidator = vine.create({
  name: vine.string().optional(),
  description: vine.string().nullable().optional(),
  format: vine.enum(['text', 'html', 'markdown']).optional(),
  content: vine.string().nullable().optional(),
  activity: vine.string().nullable().optional(),
  video: vine.string().nullable().optional(),
  order: vine.number().optional(),
  active: vine.boolean().optional(),
  limit_date: vine.string().nullable().optional(),
})
