import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'

export default class UserController {
  /**
   * @courses
   * @summary Listar los cursos activos del sitio en los que el usuario autenticado está inscrito (incluye su inscripción)
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async courses({ site, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const userId = auth.user!.id
    return LearnCourse.query()
      .where('site_id', site.id)
      .where('active', true)
      .whereHas('enrollments', (query) => query.where('user_id', userId))
      .preload('enrollments', (query) => query.where('user_id', userId))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @lessons
   * @summary Listar las lecciones completadas (vistas) por el usuario autenticado, más recientes primero, con su curso
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async lessons({ site, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const userId = auth.user!.id
    return LearnLesson.query()
      .whereHas('course', (query) => query.where('site_id', site.id))
      .whereHas('views', (query) =>
        query.whereHas('enrollment', (enrollment) => enrollment.where('user_id', userId))
      )
      .preload('course')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
}
