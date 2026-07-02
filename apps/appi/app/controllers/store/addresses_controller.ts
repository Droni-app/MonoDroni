import type { HttpContext } from '@adonisjs/core/http'
import StoreAddress from '#models/store/address'
import { storeAddressValidator, updateAddressValidator } from '#validators/store/address'

export default class AddressesController {
  /**
   * @index
   * @summary Listar mis direcciones en el sitio
   * @responseBody 200 - [{"id": "uuid", "addressLine1": "string", "city": {"id": 1, "name": "string"}}]
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async index({ site, auth }: HttpContext) {
    return StoreAddress.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .preload('city', (q) => q.preload('state'))
      .orderBy('created_at', 'desc')
  }

  /**
   * @store
   * @summary Crear una nueva dirección
   * @requestBody {"address_line1": "Calle 1 # 2-3", "city_id": 1, "postal_code": "110111", "phone": "3001234567"}
   * @responseBody 201 - {"id": "uuid", "addressLine1": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request, response }: HttpContext) {
    const data = await request.validateUsing(storeAddressValidator)
    const address = await StoreAddress.create({
      ...data,
      cityId: data.city_id ?? null,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2 ?? null,
      postalCode: data.postal_code ?? null,
      userId: auth.user!.id,
      siteId: site.id,
    })
    return response.created(address)
  }

  /**
   * @show
   * @summary Obtener una dirección propia
   * @paramPath id - ID de la dirección - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "addressLine1": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, auth, params }: HttpContext) {
    return StoreAddress.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('city', (q) => q.preload('state'))
      .firstOrFail()
  }

  /**
   * @update
   * @summary Actualizar una dirección propia
   * @paramPath id - ID de la dirección - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "addressLine1": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async update({ site, auth, params, request }: HttpContext) {
    const data = await request.validateUsing(updateAddressValidator)
    const address = await StoreAddress.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()
    address.merge({
      cityId: data.city_id !== undefined ? (data.city_id ?? null) : undefined,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2 !== undefined ? (data.address_line2 ?? null) : undefined,
      postalCode: data.postal_code !== undefined ? (data.postal_code ?? null) : undefined,
      phone: data.phone !== undefined ? (data.phone ?? null) : undefined,
      comments: data.comments !== undefined ? (data.comments ?? null) : undefined,
    })
    await address.save()
    return address
  }

  /**
   * @destroy
   * @summary Eliminar una dirección propia
   * @paramPath id - ID de la dirección - @type(string) @required
   * @responseBody 200 - {"id": "uuid"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async destroy({ site, auth, params }: HttpContext) {
    const address = await StoreAddress.query()
      .where('site_id', site.id)
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()
    await address.delete()
    return address
  }
}
