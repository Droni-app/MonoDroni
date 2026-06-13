import vine from '@vinejs/vine'

export const storePostValidator = vine.create({
  name: vine.string(),
  description: vine.string().nullable(),
  tags: vine.array(vine.string()).nullable(),
  picture: vine.string().nullable().optional(),
  content: vine.string().nullable().optional(),
  format: vine.enum(['markdown', 'html', 'plaintext']).optional(),
  active: vine.boolean().optional(),
})

export const updatePostValidator = vine.create({
  name: vine.string().optional(),
  description: vine.string().nullable().optional(),
  tags: vine.array(vine.string()).nullable().optional(),
  picture: vine.string().nullable().optional(),
  content: vine.string().nullable().optional(),
  format: vine.enum(['markdown', 'html', 'plaintext']).optional(),
  active: vine.boolean().optional(),
})
