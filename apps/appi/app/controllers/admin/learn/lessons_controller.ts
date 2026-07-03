import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import { storeLessonValidator, updateLessonValidator } from '#validators/admin/learn/lesson'
import string from '@adonisjs/core/helpers/string'

export default class LessonsController {
  /**
   * @index
   * @summary [Admin] Listar lecciones de un curso
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   */
  async index({ site, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnLesson.query()
      .where('course_id', course.id)
      .orderBy('order', 'asc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear una nueva lección
   * @paramPath course_id - ID del curso - @type(string) @required
   */
  async store({ site, params, request, response }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const data = await request.validateUsing(storeLessonValidator)
    const slugBase = string.slug(data.name)
    const existing = await LearnLesson.query()
      .where('course_id', course.id)
      .where('slug', slugBase)
      .first()
    const slug = existing ? `${slugBase}-${string.generateRandom(6)}` : slugBase
    const lesson = await LearnLesson.create({ ...data, slug, courseId: course.id })
    return response.created(lesson)
  }

  /**
   * @show
   * @summary [Admin] Obtener una lección por ID
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la lección - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    return LearnLesson.query().where('course_id', course.id).where('id', params.id).firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la lección - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const data = await request.validateUsing(updateLessonValidator)
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.id)
      .firstOrFail()
    lesson.merge(data)
    await lesson.save()
    return lesson
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la lección - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.id)
      .firstOrFail()
    await lesson.delete()
    return lesson
  }
}
