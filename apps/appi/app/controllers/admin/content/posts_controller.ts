import type { HttpContext } from '@adonisjs/core/http'
import ContentPost from '#models/content/post'
import ContentPostAttribute from '#models/content/attribute'
import { storePostValidator, updatePostValidator } from '#validators/admin/content/post'
import string from '@adonisjs/core/helpers/string'
import User from '#models/user'
import Enrollment from '#models/enrollment'
import { DateTime } from 'luxon'

export default class PostsController {
  /**
   * @index
   * @summary [Admin] Listar todos los posts del sitio
   * @paramQuery page - Número de página - @type(number)
   * @paramQuery per_page - Resultados por página (default 10) - @type(number)
   * @paramQuery q - Búsqueda por nombre o descripción - @type(string)
   * @responseBody 200 - {"meta": {"total": 15, "perPage": 10, "currentPage": 1, "lastPage": 2}, "data": [{"id": "uuid", "slug": "string", "name": "string", "description": "string", "tags": ["string"], "picture": "string|null", "format": "markdown", "active": true, "createdAt": "string", "updatedAt": "string"}]}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   */
  async index({ site, request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 10)
    const q = request.input('q', '')
    const posts = await ContentPost.query()
      .where('site_id', site.id)
      .if(q, (query) => {
        query.where('name', 'like', `%${q}%`).orWhere('description', 'like', `%${q}%`)
      })
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
    return posts
  }

  /**
   * @store
   * @summary [Admin] Crear un nuevo post
   * @requestBody {"name": "Título", "description": "Descripción", "content": "# Contenido", "format": "markdown", "tags": ["tag1"], "picture": "url|null", "active": false}
   * @responseBody 201 - {"id": "uuid", "slug": "string", "name": "string", "description": "string", "tags": ["string"], "format": "markdown", "active": false, "createdAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async store({ site, auth, request }: HttpContext) {
    const data = await request.validateUsing(storePostValidator)
    const slugBase = string.slug(data.name)
    // check if exists
    const existingPost = await ContentPost.query()
      .where('site_id', site.id)
      .where('slug', slugBase)
      .first()
    const slug = existingPost ? `${slugBase}-${string.generateRandom(6)}` : slugBase
    const post = await ContentPost.create({
      ...data,
      slug,
      siteId: site.id,
      userId: auth.user!.id,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    })
    return post
  }

  /**
   * @show
   * @summary [Admin] Obtener un post por ID
   * @paramPath id - ID del post - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "description": "string", "content": "string", "tags": ["string"], "format": "markdown", "active": true, "createdAt": "string", "updatedAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async show({ site, params }: HttpContext) {
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .preload('user')
      .preload('attributes')
      .firstOrFail()
    return post
  }

  /**
   * @update
   * @summary [Admin] Actualizar un post
   * @paramPath id - ID del post - @type(string) @required
   * @requestBody {"name": "Nuevo título", "description": "string", "content": "string", "format": "markdown", "tags": ["string"], "picture": "string|null", "active": true}
   * @responseBody 200 - {"id": "uuid", "slug": "string", "name": "string", "active": true, "updatedAt": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async update({ site, params, request }: HttpContext) {
    const data = await request.validateUsing(updatePostValidator)
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    post.merge({
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    })
    await post.save()
    return post
  }

  /**
   * @import
   * @summary [Admin] Importar un post desde JSON exportado
   * @requestBody {"name": "string", "slug": "string", "description": "string|null", "content": "string|null", "format": "markdown", "tags": ["string"], "picture": "string|null", "active": true, "user": {"email": "string", "fullName": "string"}, "attributes": [{"name": "string", "value": "string", "type": "string"}]}
   * @responseBody 201 - {"id": "uuid", "slug": "string", "name": "string", "imported": true}
   * @responseBody 400 - {"message": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async import({ site, request, response }: HttpContext) {
    const body = request.body() as Record<string, any>

    if (!body?.name) {
      return response.badRequest({ message: 'El campo "name" es requerido' })
    }

    const userEmail = body?.user?.email
    if (!userEmail) {
      return response.badRequest({ message: 'El campo "user.email" es requerido' })
    }

    let user = await User.findBy('email', userEmail)
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12)
      user = await User.create({
        email: userEmail,
        fullName: body.user?.fullName ?? userEmail.split('@')[0],
        password: randomPassword,
        emailVerifiedAt: DateTime.now(),
      })
    }

    await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      { siteId: site.id, userId: user.id, role: 'user' }
    )

    const slugBase = string.slug(body.slug ?? body.name)
    const existingPost = await ContentPost.query()
      .where('site_id', site.id)
      .where('slug', slugBase)
      .first()
    const slug = existingPost ? `${slugBase}-${string.generateRandom(6)}` : slugBase

    const post = await ContentPost.create({
      name: body.name,
      slug,
      description: body.description ?? null,
      content: body.content ?? null,
      format: ['markdown', 'html', 'plaintext'].includes(body.format) ? body.format : 'markdown',
      tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : null,
      picture: body.picture ?? null,
      active: typeof body.active === 'boolean' ? body.active : false,
      siteId: site.id,
      userId: user.id,
    })

    const attributes = Array.isArray(body.attributes) ? body.attributes : []
    for (const attr of attributes) {
      if (attr?.name && attr?.value) {
        await ContentPostAttribute.create({
          contentPostId: post.id,
          name: attr.name,
          value: String(attr.value),
          type: attr.type ?? 'string',
        })
      }
    }

    await post.load('user')
    await post.load('attributes')

    return response.created(post)
  }

  /**
   * @destroy
   * @summary [Admin] Eliminar un post
   * @paramPath id - ID del post - @type(string) @required
   * @responseBody 200 - {"id": "uuid", "name": "string", "slug": "string"}
   * @responseBody 401 - {"message": "Unauthorized"}
   * @responseBody 403 - {"message": "Forbidden"}
   * @responseBody 404 - {"message": "Not Found"}
   */
  async destroy({ site, params }: HttpContext) {
    const post = await ContentPost.query()
      .where('site_id', site.id)
      .where('id', params.id)
      .firstOrFail()
    await post.delete()
    return post
  }
}
