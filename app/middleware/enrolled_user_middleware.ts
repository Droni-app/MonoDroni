import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Enrollment from '#models/enrollment'

export default class EnrolledUserMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await Enrollment.query()
      .where('siteId', ctx.site.id)
      .andWhere('userId', ctx.auth.user?.id ?? '')
      .firstOrFail()

    return await next()
  }
}
