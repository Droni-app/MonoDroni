import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import LearnLesson from '#models/learn/lesson'
import LearnLessonQuestion from '#models/learn/lesson_question'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'
import LearnEnrollment from '#models/learn/enrollment'
import { storeQuizValidator } from '#validators/learn/quiz'
import { updateQuizValidator } from '#validators/admin/learn/quiz'
import { updateLearnCourseProgress } from '#services/learn_progress_service'

async function isCourseManager(courseId: string, userId: string) {
  const enrollment = await LearnEnrollment.query()
    .where('course_id', courseId)
    .where('user_id', userId)
    .whereIn('role', ['teacher', 'admin'])
    .first()
  return !!enrollment
}

function resolveLesson(courseId: string, lessonSlug: string) {
  return LearnLesson.query().where('course_id', courseId).where('slug', lessonSlug).firstOrFail()
}

export default class QuizzesController {
  async index({ params, request }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .preload('enrollment', (query) => query.preload('user'))
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
  async show({ auth, params }: HttpContext) {
    const manager = await isCourseManager(params.course_id, auth.user!.id)
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    return LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .preload('enrollment', (query) => query.preload('user'))
      .if(!manager, (query) =>
        query.whereHas('enrollment', (enrollmentQuery) =>
          enrollmentQuery.where('user_id', auth.user!.id)
        )
      )
      .firstOrFail()
  }
  async store({ auth, params, request, response }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)

    if (lesson.limitDate && DateTime.now() > lesson.limitDate) {
      return response.badRequest({ message: 'La fecha límite para este cuestionario ya pasó.' })
    }

    const enrollment = await LearnEnrollment.query()
      .where('course_id', lesson.courseId)
      .where('user_id', auth.user!.id)
      .where('role', 'student')
      .firstOrFail()

    const linkedQuestions = await LearnLessonQuestion.query()
      .where('lesson_id', lesson.id)
      .preload('question')

    if (linkedQuestions.length === 0) {
      return response.badRequest({ message: 'Esta lección no tiene preguntas vinculadas.' })
    }

    const data = await request.validateUsing(storeQuizValidator)
    const submitted = new Map(data.answers.map((a) => [a.question_id, a.selected]))
    const linkedIds = new Set(linkedQuestions.map((lq) => lq.questionId))

    const missing = [...linkedIds].some((id) => !submitted.has(id))
    const extra = [...submitted.keys()].some((id) => !linkedIds.has(id))
    if (missing || extra) {
      return response.badRequest({
        message: 'Debes responder exactamente todas las preguntas vinculadas a la lección.',
      })
    }

    let correctCount = 0
    const questionsSnapshot: unknown[] = []
    const gradedAnswers: unknown[] = []

    for (const linked of linkedQuestions) {
      const question = linked.question
      const selected = submitted.get(question.id)!
      const isCorrect = selected === question.responseCorrect
      if (isCorrect) {
        correctCount += 1
        question.wons += 1
      } else {
        question.losses += 1
      }
      question.difficulty = String(
        question.wons + question.losses > 0
          ? Math.round((question.losses / (question.wons + question.losses)) * 10000) / 100
          : 0
      )
      await question.save()

      questionsSnapshot.push({
        id: question.id,
        name: question.name,
        response_1: question.response1,
        response_2: question.response2,
        response_3: question.response3,
        response_4: question.response4,
        response_5: question.response5,
        response_correct: question.responseCorrect,
      })
      gradedAnswers.push({ question_id: question.id, selected, correct: isCorrect })
    }

    const results = Math.round((correctCount / linkedQuestions.length) * 10000) / 100

    const quiz = await LearnLessonQuestionsQuiz.create({
      lessonId: lesson.id,
      learnEnrollmentId: enrollment.id,
      questions: JSON.stringify(questionsSnapshot),
      answers: JSON.stringify(gradedAnswers),
      status: 'completed',
      results: String(results),
    })

    await updateLearnCourseProgress(enrollment)
    return response.created(quiz)
  }
  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateQuizValidator)
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
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
  async destroy({ params }: HttpContext) {
    const lesson = await resolveLesson(params.course_id, params.lesson_id)
    const quiz = await LearnLessonQuestionsQuiz.query()
      .where('lesson_id', lesson.id)
      .where('id', params.id)
      .firstOrFail()
    await quiz.delete()
    return quiz
  }
}
