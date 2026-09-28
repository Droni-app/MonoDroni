import Site from '#models/site'
import type { HttpContext } from '@adonisjs/core/http'

export default class SitesController {
  async index({ params, response }: HttpContext) {
    const sites = await Site.query().paginate(params.page, params.limit)
    return response.ok(sites)
  }
  async show({ params, response }: HttpContext) {
    const site = await Site.findOrFail(params.id)
    return response.ok(site)
  }
}
