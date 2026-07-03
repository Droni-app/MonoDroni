import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import { storeCourseValidator, updateCourseValidator } from '#validators/admin/learn/course'
import string from '@adonisjs/core/helpers/string'

export default class CoursesController {
  /**
   * @index
   * @summary [Admin] Listar cursos del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o descripción - @type(string)
   * @paramQuery group - Filtrar por grupo - @type(string)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q')
    const group = request.input('group')
    return LearnCourse.query()
      .where('site_id', site.id)
      .if(q, (query) => {
        query.where((builder) => {
          builder.whereLike('name', `%${q}%`).orWhereLike('description', `%${q}%`)
        })
      })
      .if(group, (query) => query.where('group', group))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear un nuevo curso
   */
  async store({ site, request, response }: HttpContext) {
    const data = await request.validateUsing(storeCourseValidator)
    const slugBase = string.slug(data.name)
    const existing = await LearnCourse.query()
      .where('site_id', site.id)
      .where('slug', slugBase)
      .first()
    const slug = existing ? `${slugBase}-${string.generateRandom(6)}` : slugBase
    const course = await LearnCourse.create({ ...data, slug, siteId: site.id })
    return response.created(course)
  }

  /**
   * @show
   * @summary [Admin] Obtener un curso por ID
   * @paramPath id - ID del curso - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return LearnCourse.query().where('site_id', site.id).where('id', params.id).firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar un curso
   * @paramPath id - ID del curso - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateCourseValidator)
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    course.merge(data)
    await course.save()
    return course
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un curso
   * @paramPath id - ID del curso - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await course.delete()
    return course
  }
}
