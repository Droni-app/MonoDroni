import vine from '@vinejs/vine'

export const storeEnrollmentValidator = vine.create({
  course_id: vine.string(),
  user_id: vine.string(),
  role: vine.enum(['student', 'teacher', 'admin']).optional(),
  status: vine.enum(['pending', 'active', 'completed', 'canceled']).optional(),
})

export const updateEnrollmentValidator = vine.create({
  role: vine.enum(['student', 'teacher', 'admin']).optional(),
  status: vine.enum(['pending', 'active', 'completed', 'canceled']).optional(),
  progress: vine.number().min(0).max(100).optional(),
})
