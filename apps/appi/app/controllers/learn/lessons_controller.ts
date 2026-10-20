import type { HttpContext } from '@adonisjs/core/http'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnEnrollment from '#models/learn/enrollment'
import LearnLessonView from '#models/learn/lesson_view'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'
import LearnLessonQuestion from '#models/learn/lesson_question'
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
  async index({ site, auth, params, request }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('slug', params.course_id)
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
  async show({ site, auth, params }: HttpContext) {
    const course = await LearnCourse.query()
      .where('site_id', site.id)
      .where('slug', params.course_id)
      .firstOrFail()
    const manager = await isCourseManager(course.id, auth.user?.id)
    const lesson = await LearnLesson.query()
      .where('course_id', course.id)
      .where('slug', params.id)
      .if(!manager, (query) => query.where('active', true))
      .firstOrFail()

    const enrollment = auth.user
      ? await LearnEnrollment.query()
          .where('course_id', course.id)
          .where('user_id', auth.user.id)
          .first()
      : null

    let myAnswer: LearnLessonAnswer | null = null
    let myQuiz: LearnLessonQuestionsQuiz | null = null
    let quizQuestions: unknown[] = []

    if (enrollment) {
      await LearnLessonView.firstOrCreate(
        { lessonId: lesson.id, learnEnrollmentId: enrollment.id },
        { lessonId: lesson.id, learnEnrollmentId: enrollment.id }
      )
      await updateLearnCourseProgress(enrollment)

      myAnswer = await LearnLessonAnswer.query()
        .where('lesson_id', lesson.id)
        .where('learn_enrollment_id', enrollment.id)
        .first()
      myQuiz = await LearnLessonQuestionsQuiz.query()
        .where('lesson_id', lesson.id)
        .where('learn_enrollment_id', enrollment.id)
        .orderBy('created_at', 'desc')
        .first()

      const linkedQuestions = await LearnLessonQuestion.query()
        .where('lesson_id', lesson.id)
        .preload('question')
      quizQuestions = linkedQuestions.map((linked) => ({
        id: linked.question.id,
        name: linked.question.name,
        description: linked.question.description,
        picture: linked.question.picture,
        response_1: linked.question.response1,
        response_2: linked.question.response2,
        response_3: linked.question.response3,
        response_4: linked.question.response4,
        response_5: linked.question.response5,
      }))
    }

    return {
      ...lesson.serialize(),
      myAnswer: myAnswer
        ? {
            id: myAnswer.id,
            answer: myAnswer.answer,
            attachment: myAnswer.attachment,
            feedback: myAnswer.feedback,
            result: myAnswer.result,
          }
        : null,
      myQuiz: myQuiz
        ? {
            id: myQuiz.id,
            status: myQuiz.status,
            results: myQuiz.results,
            answers: myQuiz.answers,
          }
        : null,
      quizQuestions,
    }
  }
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
  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateLessonValidator)
    const lesson = await LearnLesson.query()
      .where('course_id', params.course_id)
      .where('slug', params.id)
      .firstOrFail()
    lesson.merge(data)
    await lesson.save()
    return lesson
  }
  async destroy({ params }: HttpContext) {
    const lesson = await LearnLesson.query()
      .where('course_id', params.course_id)
      .where('slug', params.id)
      .firstOrFail()
    await lesson.delete()
    return lesson
  }
}
