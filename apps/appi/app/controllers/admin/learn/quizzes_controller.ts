import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'
import { updateQuizValidator } from '#validators/admin/learn/quiz'

export default class QuizzesController {
  /**
   * @index
   * @summary [Admin] Listar intentos de cuestionario de una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   */
  async index({ site, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .preload('enrollment', (query) => query.preload('user'))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary [Admin] Obtener un intento de cuestionario por ID
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID del intento - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    return LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .preload('enrollment', (query) => query.preload('user'))
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Corregir el estado/resultado de un intento de cuestionario
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID del intento - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('id', params.lesson_id)
      .firstOrFail()
    const data = await request.validateUsing(updateQuizValidator)
    const quiz = await LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    quiz.merge({
      ...data,
      results:
        data.results !== null && data.results !== undefined ? String(data.results) : data.results,
    })
    await quiz.save()
    return quiz
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un intento de cuestionario
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID del intento - @type(string) @required
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
    const quiz = await LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    await quiz.delete()
    return quiz
  }
}
