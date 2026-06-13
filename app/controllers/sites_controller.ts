import Site from '#models/site'
import type { HttpContext } from '@adonisjs/core/http'

export default class SitesController {
  /**
   * @index
   * @summary Listar sitios disponibles
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery limit - Resultados por página - @type(number)
   * @responseBody 200 - {"meta": {"total": 1, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": [{"id": "uuid", "name": "Dronico", "url": "https://droni.co"}]}
   */
  async index({ params, response }: HttpContext) {
    const sites = await Site.query().paginate(params.page, params.limit)
    return response.ok(sites)
  }
  /**
   * @show
   * @summary Obtener un sitio por ID
   * @paramPath id - ID del sitio - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "name": "Dronico", "url": "https://droni.co", "createdAt": "string"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ params, response }: HttpContext) {
    const site = await Site.findOrFail(params.id)
    return response.ok(site)
  }
}
