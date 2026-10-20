import type { HttpContext } from '@adonisjs/core/http'
import LearnQuestion from '#models/learn/question'
import { storeQuestionValidator, updateQuestionValidator } from '#validators/admin/learn/question'

export default class QuestionsController {
  async index({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnQuestion.query()
      .where('course_id', params.course_id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
  async show({ params }: HttpContext) {
    return LearnQuestion.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .firstOrFail()
  }
  async store({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(storeQuestionValidator)
    const question = await LearnQuestion.create({ ...data, courseId: params.course_id })
    return response.created(question)
  }
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
  async destroy({ params }: HttpContext) {
    const question = await LearnQuestion.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .firstOrFail()
    await question.delete()
    return question
  }
}
