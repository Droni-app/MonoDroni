import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnEnrollment from '#models/learn/enrollment'

export default class EnrollmentsController {
  async index({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnEnrollment.query()
      .where('course_id', params.course_id)
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
  async show({ params }: HttpContext) {
    return LearnEnrollment.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .preload('user')
      .firstOrFail()
  }
  async store({ site, auth, params, response }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('slug', params.course_id)
      .where('active', true)
      .firstOrFail()

    if (!course.autoEnroll) {
      return response.badRequest({ message: 'Este curso no permite auto-inscripción.' })
    }

    const existing = await LearnEnrollment.query()
      .where('course_id', course.id)
      .where('user_id', auth.user!.id)
      .first()
    if (existing) {
      return response.badRequest({ message: 'Ya estás inscrito en este curso.' })
    }

    const enrollment = await LearnEnrollment.create({
      courseId: course.id,
      userId: auth.user!.id,
      role: 'student',
      status: 'active',
    })
    return response.created(enrollment)
  }
}
