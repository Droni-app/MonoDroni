import type { HttpContext } from '@adonisjs/core/http'
import Enrollment from '#models/enrollment'

export default class SiteUsersController {
  /**
   * @index
   * @summary [Admin] Buscar usuarios del sitio para asignarlos a un curso
   * @paramQuery q - Búsqueda por nombre o email - @type(string)
   * @responseBody 200 - [{"id": "uuid", "fullName": "string", "email": "string"}]
   */
  async index({ site, request }: HttpContext) {
    const q = request.input('q')
    const enrollments = await Enrollment.query()
      .where('site_id', site.id)
      .preload('user')
      .if(q, (query) => {
        query.whereHas('user', (userQuery) => {
          userQuery.where((builder) => {
            builder.whereILike('full_name', `%${q}%`).orWhereILike('email', `%${q}%`)
          })
        })
      })
      .limit(20)
    return enrollments.map((enrollment) => enrollment.user)
  }
}
