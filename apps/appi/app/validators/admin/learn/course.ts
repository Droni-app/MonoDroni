import vine from '@vinejs/vine'

export const storeCourseValidator = vine.create({
  name: vine.string(),
  group: vine.string().nullable().optional(),
  description: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  video: vine.string().nullable().optional(),
  auto_enroll: vine.boolean().optional(),
  active: vine.boolean().optional(),
})

export const updateCourseValidator = vine.create({
  name: vine.string().optional(),
  group: vine.string().nullable().optional(),
  description: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  video: vine.string().nullable().optional(),
  auto_enroll: vine.boolean().optional(),
  active: vine.boolean().optional(),
})
