import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import LearnEnrollment from '#models/learn/enrollment'

/**
 * Requires the authenticated user to hold one of the given course-level
 * roles (learn_enrollments.role) for the course identified by the
 * `course_id` route param. Used on the public /learn routes, distinct from
 * the site-level `adminSite`/`enrolledUser` middleware.
 */
export default class CourseRoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { roles: Array<'student' | 'teacher' | 'admin'> }
  ) {
    await LearnEnrollment.query()
      .where('course_id', ctx.params.course_id)
      .andWhere('user_id', ctx.auth.user?.id ?? '')
      .whereIn('role', options.roles)
      .firstOrFail()

    return await next()
  }
}
