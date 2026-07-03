import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import LearnLesson from '#models/learn/lesson'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnEnrollment from '#models/learn/enrollment'
import { storeAnswerValidator } from '#validators/learn/answer'
import { updateAnswerValidator } from '#validators/admin/learn/answer'
import { updateLearnCourseProgress } from '#services/learn_progress_service'

async function isCourseManager(courseId: string, userId: string) {
  const enrollment = await LearnEnrollment.query()
    .where('course_id', courseId)
    .where('user_id', userId)
    .whereIn('role', ['teacher', 'admin'])
    .first()
  return !!enrollment
}

export default class AnswersController {
  /**
   * @index
   * @summary [Teacher/Admin] Listar respuestas enviadas para una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   */
  async index({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnLessonAnswer.query()
      .where('lesson_id', params.lesson_id)
      .preload('enrollment', (query) => query.preload('user'))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary Ver una respuesta (el estudiante solo ve la propia, teacher/admin ven cualquiera)
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID de la respuesta - @type(string) @required
   */
  async show({ auth, params }: HttpContext) {
    const manager = await isCourseManager(params.course_id, auth.user!.id)
    return LearnLessonAnswer.query()
      .where('lesson_id', params.lesson_id)
      .where('id', params.id)
      .preload('enrollment', (query) => query.preload('user'))
      .if(!manager, (query) =>
        query.whereHas('enrollment', (enrollmentQuery) =>
          enrollmentQuery.where('user_id', auth.user!.id)
        )
      )
      .firstOrFail()
  }

  /**
   * @store
   * @summary [Student] Enviar la respuesta de actividad de una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   */
  async store({ auth, params, request, response }: HttpContext) {
    const lesson = await LearnLesson.query().where('id', params.lesson_id).firstOrFail()

    if (!lesson.activity) {
      return response.badRequest({ message: 'Esta lección no tiene actividad.' })
    }
    if (lesson.limitDate && DateTime.now() > lesson.limitDate) {
      return response.badRequest({ message: 'La fecha límite para enviar esta actividad ya pasó.' })
    }

    const enrollment = await LearnEnrollment.query()
      .where('course_id', lesson.courseId)
      .where('user_id', auth.user!.id)
      .where('role', 'student')
      .firstOrFail()

    const existing = await LearnLessonAnswer.query()
      .where('lesson_id', lesson.id)
      .where('learn_enrollment_id', enrollment.id)
      .first()
    if (existing) {
      return response.badRequest({ message: 'Ya enviaste una respuesta para esta lección.' })
    }

    const data = await request.validateUsing(storeAnswerValidator)
    const answer = await LearnLessonAnswer.create({
      ...data,
      lessonId: lesson.id,
      learnEnrollmentId: enrollment.id,
    })
    await updateLearnCourseProgress(enrollment)
    return response.created(answer)
  }

  /**
   * @update
   * @summary [Teacher/Admin] Calificar una respuesta (feedback/result)
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath lesson_id - ID de la lección - @type(string) @required
   * @paramPath id - ID de la respuesta - @type(string) @required
   */
  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateAnswerValidator)
    const answer = await LearnLessonAnswer.query()
      .where('lesson_id', params.lesson_id)
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
  async destroy({ params }: HttpContext) {
    const answer = await LearnLessonAnswer.query()
      .where('lesson_id', params.lesson_id)
      .where('id', params.id)
      .firstOrFail()
    await answer.delete()
    return answer
  }
}
