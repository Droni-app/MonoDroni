import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnQuestion from '#models/learn/question'
import { storeQuestionValidator, updateQuestionValidator } from '#validators/admin/learn/question'

export default class QuestionsController {
  /**
   * @index
   * @summary [Admin] Listar preguntas del banco de un curso
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
    return LearnQuestion.query()
      .where('course_id', course.id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear una nueva pregunta
   * @paramPath course_id - ID del curso - @type(string) @required
   */
  async store({ site, params, request, response }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const data = await request.validateUsing(storeQuestionValidator)
    const question = await LearnQuestion.create({ ...data, courseId: course.id })
    return response.created(question)
  }

  /**
   * @show
   * @summary [Admin] Obtener una pregunta por ID
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la pregunta - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    return LearnQuestion.query().where('course_id', course.id).where('id', params.id).firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar una pregunta
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la pregunta - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const data = await request.validateUsing(updateQuestionValidator)
    const question = await LearnQuestion.query()
      .where('course_id', course.id)
      .where('id', params.id)
      .firstOrFail()
    question.merge(data)
    await question.save()
    return question
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar una pregunta
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la pregunta - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const question = await LearnQuestion.query()
      .where('course_id', course.id)
      .where('id', params.id)
      .firstOrFail()
    await question.delete()
    return question
  }
}
