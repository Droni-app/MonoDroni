import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnLessonQuestion from '#models/learn/lesson_question'
import { storeLessonQuestionValidator } from '#validators/admin/learn/lesson_question'

export default class LessonExamQuestionsController {
  /**
   * @index
   * @summary [Admin] Listar preguntas vinculadas a una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   */
  async index({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    return LearnLessonQuestion.query().where('lesson_id', lesson.id).preload('question')
  }

  /**
   * @store
   * @summary [Admin] Vincular una pregunta del banco del curso a la lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @requestBody {"question_id": "uuid"}
   */
  async store({ site, params, request, response }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    const data = await request.validateUsing(storeLessonQuestionValidator)
    const question = await course
      .related('questions')
      .query()
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

  /**
   * @destroy
   * @summary [Admin] Desvincular una pregunta de la lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID del vínculo - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    const lessonQuestion = await LearnLessonQuestion.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    await lessonQuestion.delete()
    return lessonQuestion
  }
}
