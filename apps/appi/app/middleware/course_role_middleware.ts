import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import LearnCourse from '#models/learn/course'
import LearnEnrollment from '#models/learn/enrollment'

/**
 * Requires the authenticated user to hold one of the given course-level
 * roles (learn_enrollments.role) for the course identified by the
 * `course_id` route param. Used on the public /learn routes, distinct from
 * the site-level `adminSite`/`enrolledUser` middleware.
 *
 * The public API addresses courses by slug, but `learn_enrollments` (and
 * every nested resource) is keyed by the real course id. This middleware
 * resolves the slug once and rewrites `ctx.params.course_id` to the real id,
 * so every downstream controller can keep matching on it directly.
 */
export default class CourseRoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { roles: Array<'student' | 'teacher' | 'admin'> }
  ) {
    const course = await LearnCourse.query()
      .where('site_id', ctx.site.id)
      .where('slug', ctx.params.course_id)
      .first()

    if (!course) {
      return ctx.response.notFound({ message: 'Curso no encontrado.' })
    }

    const enrollment = await LearnEnrollment.query()
      .where('course_id', course.id)
      .andWhere('user_id', ctx.auth.user?.id ?? '')
      .whereIn('role', options.roles)
      .first()

    if (!enrollment) {
      return ctx.response.forbidden({
        message: 'No tienes el rol necesario en este curso para realizar esta acción.',
      })
    }

    ctx.params.course_id = course.id

    return await next()
  }
}
