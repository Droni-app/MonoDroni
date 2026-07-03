import type { HttpContext } from '@adonisjs/core/http'
import LearnQuestion from '#models/learn/question'
import { storeQuestionValidator, updateQuestionValidator } from '#validators/admin/learn/question'

export default class QuestionsController {
  /**
   * @index
   * @summary [Teacher/Admin] Listar preguntas del banco de un curso
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   */
  async index({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnQuestion.query()
      .where('course_id', params.course_id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Teacher/Admin] Obtener una pregunta por ID
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la pregunta - @type(string) @required
   */
  async show({ params }: HttpContext) {
    return LearnQuestion.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .firstOrFail()
  }

  /**
   * @store
   * @summary [Admin] Crear una nueva pregunta
   * @paramPath course_id - ID del curso - @type(string) @required
   */
  async store({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(storeQuestionValidator)
    const question = await LearnQuestion.create({ ...data, courseId: params.course_id })
    return response.created(question)
  }

  /**
   * @update
   * @summary [Teacher/Admin] Actualizar una pregunta
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la pregunta - @type(string) @required
   */
  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateQuestionValidator)
    const question = await LearnQuestion.query()
      .where('course_id', params.course_id)
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
  async destroy({ params }: HttpContext) {
    const question = await LearnQuestion.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .firstOrFail()
    await question.delete()
    return question
  }
}
