import vine from '@vinejs/vine'

export const storeProductValidator = vine.create({
  name: vine.string(),
  description: vine.string().nullable().optional(),
  content: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  price: vine.number().min(0),
  stock: vine.number().min(0),
  tags: vine.array(vine.string()).nullable().optional(),
  size_w: vine.number().min(0).nullable().optional(),
  size_h: vine.number().min(0).nullable().optional(),
  size_d: vine.number().min(0).nullable().optional(),
  weight: vine.number().min(0).nullable().optional(),
  active: vine.boolean().optional(),
})

export const updateProductValidator = vine.create({
  name: vine.string().optional(),
  description: vine.string().nullable().optional(),
  content: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  price: vine.number().min(0).optional(),
  stock: vine.number().min(0).optional(),
  tags: vine.array(vine.string()).nullable().optional(),
  size_w: vine.number().min(0).nullable().optional(),
  size_h: vine.number().min(0).nullable().optional(),
  size_d: vine.number().min(0).nullable().optional(),
  weight: vine.number().min(0).nullable().optional(),
  active: vine.boolean().optional(),
})
