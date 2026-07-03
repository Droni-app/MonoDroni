import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnEnrollment from '#models/learn/enrollment'
import { storeAnswerValidator, updateAnswerValidator } from '#validators/admin/learn/answer'

export default class AnswersController {
  /**
   * @index
   * @summary [Admin] Listar respuestas de actividad de una lección
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
    return LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .preload('enrollment', (query) => query.preload('user'))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Registrar manualmente la respuesta de un usuario
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
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
    const data = await request.validateUsing(storeAnswerValidator)

    const enrollment = await LearnEnrollment.query()
      .where('course_id', course.id)
      .where('user_id', data.user_id)
      .first()
    if (!enrollment) {
      return response.badRequest({ message: 'Este usuario no está inscrito en el curso.' })
    }

    const existing = await LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .where('learn_enrollment_id', enrollment.id)
      .first()
    if (existing) {
      return response.badRequest({
        message: 'Este usuario ya registró una respuesta para esta lección.',
      })
    }
    const answer = await LearnLessonAnswer.create({
      ...data,
      result: data.result !== null && data.result !== undefined ? String(data.result) : data.result,
      lessonId: lesson.id,
      learnEnrollmentId: enrollment.id,
    })
    return response.created(answer)
  }

  /**
   * @show
   * @summary [Admin] Obtener una respuesta por ID
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID de la respuesta - @type(string) @required
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
    return LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .preload('enrollment', (query) => query.preload('user'))
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Calificar una respuesta (feedback/result)
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID de la respuesta - @type(string) @required
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
    const data = await request.validateUsing(updateAnswerValidator)
    const answer = await LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    answer.merge({
      ...data,
      result: data.result !== null && data.result !== undefined ? String(data.result) : data.result,
    })
    await answer.save()
    return answer
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar una respuesta
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID de la respuesta - @type(string) @required
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
    const answer = await LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    await answer.delete()
    return answer
  }
}
