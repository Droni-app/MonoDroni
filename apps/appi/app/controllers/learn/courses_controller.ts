import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnEnrollment from '#models/learn/enrollment'

export default class CoursesController {
  /**
   * @index
   * @summary Listar cursos activos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery group - Filtrar por grupo - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const group = request.input('group')
    return LearnCourse.query()
      .where('site_id', site.id)
      .where('active', true)
      .if(group, (query) => query.where('group', group))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary Obtener un curso activo por slug (incluye la inscripción del usuario autenticado, si existe)
   * @paramPath id - Slug del curso - @type(string) @required
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, auth, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('active', true)
      .where('slug', params.id)
      .firstOrFail()

    const enrollment = auth.user
      ? await LearnEnrollment.query()
          .where('course_id', course.id)
          .where('user_id', auth.user.id)
          .first()
      : null

    return {
      ...course.serialize(),
      enrollment: enrollment
        ? {
            id: enrollment.id,
            role: enrollment.role,
            status: enrollment.status,
            progress: enrollment.progress,
          }
        : null,
    }
  }
}
