import LearnLesson from '#models/learn/lesson'
import LearnLessonView from '#models/learn/lesson_view'
import type LearnEnrollment from '#models/learn/enrollment'

/**
 * Progress is the share of the course's active lessons the enrolled user has
 * viewed at least once (learn_lesson_views). Called after saving a lesson
 * view, lesson answer, or quiz attempt, per the Learn module spec.
 */
export async function updateLearnCourseProgress(enrollment: LearnEnrollment) {
  const totalResult = await LearnLesson.query()
    .where('course_id', enrollment.courseId)
    .where('active', true)
    .count('* as total')
  const total = Number(totalResult[0].$extras.total)

  if (total === 0) {
    return
  }

  const viewedResult = await LearnLessonView.query()
    .where('learn_enrollment_id', enrollment.id)
    .whereHas('lesson', (query) => query.where('active', true))
    .count('* as total')
  const viewed = Number(viewedResult[0].$extras.total)

  enrollment.progress = String(Math.round((viewed / total) * 10000) / 100)
  await enrollment.save()
}
