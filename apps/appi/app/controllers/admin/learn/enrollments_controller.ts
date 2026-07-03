import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnEnrollment from '#models/learn/enrollment'
import {
  storeEnrollmentValidator,
  updateEnrollmentValidator,
} from '#validators/admin/learn/enrollment'

export default class EnrollmentsController {
  /**
   * @index
   * @summary [Admin] Listar inscripciones del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery course_id - Filtrar por curso - @type(string)
   * @paramQuery role - Filtrar por rol - @type(string)
   * @paramQuery status - Filtrar por estado - @type(string)
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const courseId = request.input('course_id')
    const role = request.input('role')
    const status = request.input('status')
    return LearnEnrollment.query()
      .whereHas('course', (query) => query.where('site_id', site.id))
      .if(courseId, (query) => query.where('course_id', courseId))
      .if(role, (query) => query.where('role', role))
      .if(status, (query) => query.where('status', status))
      .preload('user')
      .preload('course')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Inscribir un usuario a un curso
   * @requestBody {"course_id": "uuid", "user_id": "uuid", "role": "student", "status": "active"}
   */
  async store({ site, request, response }: HttpContext) {
    const data = await request.validateUsing(storeEnrollmentValidator)
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', data.course_id)
      .firstOrFail()
    const existing = await LearnEnrollment.query()
      .where('course_id', course.id)
      .where('user_id', data.user_id)
      .first()
    if (existing) {
      return response.badRequest({ message: 'El usuario ya está inscrito en este curso.' })
    }
    const enrollment = await LearnEnrollment.create({ ...data, courseId: course.id })
    return response.created(enrollment)
  }

  /**
   * @show
   * @summary [Admin] Obtener una inscripción por ID
   * @paramPath id - ID de la inscripción - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return LearnEnrollment.query()
      .whereHas('course', (query) => query.where('site_id', site.id))
      .where('id', params.id)
      .preload('user')
      .preload('course')
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar rol/estado/progreso de una inscripción
   * @paramPath id - ID de la inscripción - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateEnrollmentValidator)
    const enrollment = await LearnEnrollment.query()
      .whereHas('course', (query) => query.where('site_id', site.id))
      .where('id', params.id)
      .firstOrFail()
    enrollment.merge({
      ...data,
      progress: data.progress !== undefined ? String(data.progress) : data.progress,
    })
    await enrollment.save()
    return enrollment
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar una inscripción
   * @paramPath id - ID de la inscripción - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const enrollment = await LearnEnrollment.query()
      .whereHas('course', (query) => query.where('site_id', site.id))
      .where('id', params.id)
      .firstOrFail()
    await enrollment.delete()
    return enrollment
  }
}
