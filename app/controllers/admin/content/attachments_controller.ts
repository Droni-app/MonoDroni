import type { HttpContext } from '@adonisjs/core/http'
import ContentAttachment from '#models/content/attachment'
import { storeAttachmentValidator } from '#validators/admin/content/attachment'
import string from '@adonisjs/core/helpers/string'
import drive from '@adonisjs/drive/services/main'

export default class AttachmentsController {
  /**
   * @index
   * @summary [Admin] Listar todos los attachments del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre - @type(string)
   * @responseBody 200 - {"meta": {"total": 5, "perPage": 10, "currentPage": 1, "lastPage": 1}, "data": [{"id": "uuid", "userId": "uuid", "name": "string", "path": "string", "size": 1024, "mime": "image/jpeg", "createdAt": "string"}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q', '')
    const attachments = await ContentAttachment.query()
      .where('site_id', site.id)
      .where((query) => {
        if (q) {
          query.where('name', 'like', `%${q}%`)
        }
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
    return attachments
  }

  /**
   * @store
   * @summary [Admin] Subir un archivo adjunto (multipart/form-data)
   * @requestBody {"file": "binary", "name": "string (opcional)"}
   * @responseBody 201 - {"id": "uuid", "siteId": "string", "userId": "uuid", "name": "string", "path": "string", "size": 1024, "mime": "image/jpeg", "createdAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request }: HttpContext) {
    const data = await request.validateUsing(storeAttachmentValidator)

    // Generar ruta única por sitio y usuario
    const path = `${site.id}/${auth.user!.id}/${data.file.size}-${string.slug(data.file.clientName)}`

    // store file
    await data.file.moveToDisk(path)

    const attachment = await ContentAttachment.create({
      siteId: site.id,
      userId: auth.user!.id,
      name: data.name ?? data.file.clientName,
      path: data.file.meta?.path ?? path,
      size: data.file.size,
      mime: data.file.type ?? data.file.subtype,
    })
    return attachment
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un archivo adjunto
   * @paramPath id - ID del attachment - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "name": "string", "path": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async destroy({ site, params }: HttpContext) {
    const attachment = await ContentAttachment.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    // Eliminar el archivo físico
    const disk = drive.use()
    await disk.delete(attachment.path)

    await attachment.delete()
    return attachment
  }
}
