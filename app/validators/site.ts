import vine from '@vinejs/vine'

export const createSiteValidator = vine.create({
  name: vine.string().minLength(1).maxLength(255),
  url: vine.string().url().maxLength(500),
  description: vine.string().maxLength(1000).nullable().optional(),
  logo: vine.string().maxLength(500).nullable().optional(),
})

export const updateSiteValidator = vine.create({
  name: vine.string().minLength(1).maxLength(255).optional(),
  url: vine.string().url().maxLength(500).optional(),
  description: vine.string().maxLength(1000).nullable().optional(),
  logo: vine.string().maxLength(500).nullable().optional(),
})
