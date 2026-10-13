import type { HttpContext } from '@adonisjs/core/http'
import ContentAttachment from '#models/content/attachment'
import { storeAttachmentValidator } from '#validators/admin/content/attachment'
import string from '@adonisjs/core/helpers/string'
import drive from '@adonisjs/drive/services/main'

export default class AttachmentsController {
  async index({ site, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const attachments = await ContentAttachment.query()
      .where('site_id', site.id)
      .andWhere('user_id', auth.user!.id)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
    return attachments
  }
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
  async destroy({ site, auth, params }: HttpContext) {
    const attachment = await ContentAttachment.query()
      .where('site_id', site.id)
      .andWhere('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()
    // Eliminar el archivo físico
    const disk = drive.use()
    await disk.delete(attachment.path)

    await attachment.delete()
    return attachment
  }
}
