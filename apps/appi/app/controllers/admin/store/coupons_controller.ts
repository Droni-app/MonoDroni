import type { HttpContext } from '@adonisjs/core/http'
import StoreCoupon from '#models/store/coupon'
import { storeCouponValidator, updateCouponValidator } from '#validators/admin/store/coupon'
import { DateTime } from 'luxon'

export default class CouponsController {
  /**
   * @index
   * @summary [Admin] Listar cupones del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @responseBody 200 - {"meta": {"total": 0, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": []}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    return StoreCoupon.query()
      .where('site_id', site.id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  /**
   * @store
   * @summary [Admin] Crear un nuevo cupón
   */
  async store({ site, request, response }: HttpContext) {
    const data = await request.validateUsing(storeCouponValidator)
    const coupon = await StoreCoupon.create({
      ...data,
      siteId: site.id,
      discount: String(data.discount),
      expirationDate: data.expiration_date ? DateTime.fromISO(data.expiration_date) : null,
    })
    return response.created(coupon)
  }

  /**
   * @show
   * @summary [Admin] Obtener un cupón por ID
   * @paramPath id - ID del cupón - @type(string) @required
   */
  async show({ site, params }: HttpContext) {
    return StoreCoupon.query().where('site_id', site.id).where('id', params.id).firstOrFail()
  }

  /**
   * @update
   * @summary [Admin] Actualizar un cupón
   * @paramPath id - ID del cupón - @type(string) @required
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updateCouponValidator)
    const coupon = await StoreCoupon.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    coupon.merge({
      ...data,
      discount: data.discount !== undefined ? String(data.discount) : undefined,
      expirationDate:
        data.expiration_date !== undefined
          ? data.expiration_date
            ? DateTime.fromISO(data.expiration_date)
            : null
          : undefined,
    })
    await coupon.save()
    return coupon
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un cupón
   * @paramPath id - ID del cupón - @type(string) @required
   */
  async destroy({ site, params }: HttpContext) {
    const coupon = await StoreCoupon.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await coupon.delete()
    return coupon
  }
}
