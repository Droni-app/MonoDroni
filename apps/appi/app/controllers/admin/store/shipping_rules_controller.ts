import type { HttpContext } from '@adonisjs/core/http'
import StoreShippingRule from '#models/store/shipping_rule'
import {
  storeShippingRuleValidator,
  updateShippingRuleValidator,
} from '#validators/admin/store/shipping_rule'

export default class ShippingRulesController {
  /**
   * @index
   * @summary [Admin] Listar reglas de envío del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return StoreShippingRule.query()
      .where('site_id', site.id)
      .preload('state')
      .preload('city')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear una nueva regla de envío
   */
  async store({ site, request, response }: HttpContext) {
    const data = await request.validateUsing(storeShippingRuleValidator)
    const rule = await StoreShippingRule.create({
      ...data,
      siteId: site.id,
      price: String(data.price),
      stateId: data.state_id ?? null,
      cityId: data.city_id ?? null,
      pricePerKg:
        data.price_per_kg !== null && data.price_per_kg !== undefined
          ? String(data.price_per_kg)
          : null,
      pricePerCm3:
        data.price_per_cm3 !== null && data.price_per_cm3 !== undefined
          ? String(data.price_per_cm3)
          : null,
    })
    return response.created(rule)
  }

  /**
   * @show
   * @summary [Admin] Obtener una regla de envío por ID
   * @paramPath id - ID de la regla - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return StoreShippingRule.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('state')
      .preload('city')
      .firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar una regla de envío
   * @paramPath id - ID de la regla - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateShippingRuleValidator)
    const rule = await StoreShippingRule.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    rule.merge({
      ...data,
      price: data.price !== undefined ? String(data.price) : undefined,
      stateId: data.state_id !== undefined ? (data.state_id ?? null) : undefined,
      cityId: data.city_id !== undefined ? (data.city_id ?? null) : undefined,
      pricePerKg:
        data.price_per_kg !== undefined
          ? data.price_per_kg !== null
            ? String(data.price_per_kg)
            : null
          : undefined,
      pricePerCm3:
        data.price_per_cm3 !== undefined
          ? data.price_per_cm3 !== null
            ? String(data.price_per_cm3)
            : null
          : undefined,
    })
    await rule.save()
    return rule
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar una regla de envío
   * @paramPath id - ID de la regla - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const rule = await StoreShippingRule.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await rule.delete()
    return rule
  }
}
