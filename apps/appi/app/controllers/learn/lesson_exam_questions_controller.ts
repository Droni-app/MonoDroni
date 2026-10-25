import type { HttpContext } from '@adonisjs/core/http'
import LearnLesson from '#models/learn/lesson'
import LearnQuestion from '#models/learn/question'
import LearnLessonQuestion from '#models/learn/lesson_question'
import { storeLessonQuestionValidator } from '#validators/admin/learn/lesson_question'

function resolveLesson(courseId: string, lessonSlug: string) {
  return LearnLesson.query().where('course_id', courseId).where('slug', lessonSlug).firstOrFail()
}

export default class LessonExamQuestionsController {
  async index({ params }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    return LearnLessonQuestion.query().where('lesson_id', lesson.id).preload('question')
  }
  async store({ params, request, response }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    const data = await request.validateUsing(storeLessonQuestionValidator)
    const question = await LearnQuestion.query()
      .where('course_id', params.course_id)
      .where('id', data.question_id)
      .firstOrFail()
    const existing = await LearnLessonQuestion.query()
      .where('lesson_id', lesson.id)
      .where('question_id', question.id)
      .first()
    if (existing) {
      return response.badRequest({ message: 'Esta pregunta ya está vinculada a la lección.' })
    }
    const lessonQuestion = await LearnLessonQuestion.create({
      lessonId: lesson.id,
      questionId: question.id,
    })
    return response.created(lessonQuestion)
  }
  async destroy({ params }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    const lessonQuestion = await LearnLessonQuestion.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    await lessonQuestion.delete()
    return lessonQuestion
  }
}
