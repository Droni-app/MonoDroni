import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnEnrollment from '#models/learn/enrollment'
import LearnLessonView from '#models/learn/lesson_view'
import { storeLessonValidator, updateLessonValidator } from '#validators/admin/learn/lesson'
import { updateLearnCourseProgress } from '#services/learn_progress_service'
import string from '@adonisjs/core/helpers/string'

async function isCourseManager(courseId: string, userId?: string) {
  if (!userId) return false
  const enrollment = await LearnEnrollment.query()
    .where('course_id', courseId)
    .where('user_id', userId)
    .whereIn('role', ['teacher', 'admin'])
    .first()
  return !!enrollment
}

export default class LessonsController {
  /**
   * @index
   * @summary Listar lecciones activas de un curso (teachers/admins ven también las inactivas)
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   */
  async index({ site, auth, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const manager = await isCourseManager(course.id, auth.user?.id)
    return LearnLesson.query()
      .where('course_id', course.id)
      .if(!manager, (query) => query.where('active', true))
      .orderBy('order', 'asc')
      .paginate(page, perPage)
  }

  /**
   * @show
   * @summary Ver una lección por slug (registra la vista y actualiza el progreso)
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - Slug de la lección - @type(string) @required
   */
  async show({ site, auth, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('id', params.course_id)
      .firstOrFail()
    const manager = await isCourseManager(course.id, auth.user?.id)
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('slug', params.id)
      .if(!manager, (query) => query.where('active', true))
      .firstOrFail()

    if (auth.user) {
      const enrollment = await LearnEnrollment.query()
        .where('course_id', course.id)
        .where('user_id', auth.user.id)
        .first()
      if (enrollment) {
        await LearnLessonView.firstOrCreate(
          { lessonId: lesson.id, learnEnrollmentId: enrollment.id },
          { lessonId: lesson.id, learnEnrollmentId: enrollment.id }
        )
        await updateLearnCourseProgress(enrollment)
      }
    }

    return lesson
  }

  /**
   * @store
   * @summary [Teacher/Admin] Crear una nueva lección
   * @paramPath course_id - ID del curso - @type(string) @required
   */
  async store({ params, request, response }: HttpContext) {
    const data = await request.validateUsing(storeLessonValidator)
    const slugBase = string.slug(data.name)
    const existing = await LearnLesson.query()
      .where('course_id', params.course_id)
      .where('slug', slugBase)
      .first()
    const slug = existing ? `${slugBase}-${string.generateRandom(6)}` : slugBase
    const lesson = await LearnLesson.create({ ...data, slug, courseId: params.course_id })
    return response.created(lesson)
  }

  /**
   * @update
   * @summary [Teacher/Admin] Actualizar una lección
   * @paramPath course_id - ID del curso - @type(string) @required
   * @paramPath id - ID de la lección - @type(string) @required
   */
  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateLessonValidator)
    const lesson = await LearnLesson.query()
      .where('course_id', params.course_id)
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
  async destroy({ params }: HttpContext) {
    const lesson = await LearnLesson.query()
      .where('course_id', params.course_id)
      .where('id', params.id)
      .firstOrFail()
    await lesson.delete()
    return lesson
  }
}
