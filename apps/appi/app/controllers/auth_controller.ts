import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Enrollment from '#models/enrollment'
import { DateTime } from 'luxon'
import Site from '#models/site'
import { verifyLogin } from '#services/login_throttle'

export default class AuthController {
  /**
   * @verifyEmail
   * @summary Verificar email con enlace firmado (solo enlaces ya enviados; los nuevos usan /oauth/verify-email)
   * @paramPath enrollmentId - ID del enrollment incluido en el enlace de verificación - @type(string) @required
   * @responseBody 302 - Redirige a la URL del site si el enlace es válido
   * @responseBody 400 - {"message": "Invalid or expired verification link"}
   */
  async verifyEmail({ request, response }: HttpContext) {
    if (!request.hasValidSignature()) {
      return response.badRequest('Invalid or expired verification link')
    }
    const enrollmentId = request.param('enrollmentId')
    const enrollment = await Enrollment.findOrFail(enrollmentId)
    // update user email verification
    const user = await User.findOrFail(enrollment.userId)
    const site = await Site.findOrFail(enrollment.siteId)
    user.emailVerifiedAt = DateTime.now()
    await user.save()

    return response.redirect(site.url, false)
  }

  /**
   * @login
   * @summary Iniciar sesión
   * @requestBody {"email": "user@example.com", "password": "password123"}
   * @responseBody 200 - {"user": {"id": "uuid", "fullName": "string", "email": "string", "avatar": "string|null"}, "enrollment": {"id": "uuid", "role": "user|owner"}, "token": "oat_xxxxxxxxxxxx"}
   * @responseBody 400 - {"message": "Email not verified."}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   * @responseBody 429 - {"errors": [{"message": "string", "retryAfter": 900}]}
   */
  async login({ request, site, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await verifyLogin(request, email, password)
    const enrollment = await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      {
        siteId: site.id,
        userId: user.id,
        role: 'user',
      }
    )

    // if user has no activation email verified, send it again
    if (!user.emailVerifiedAt) {
      return response.badRequest({ message: 'Email not verified.' })
    }
    const token = await User.accessTokens.create(user)

    return {
      user: user,
      enrollment: enrollment,
      token: token.value!.release(),
    }
  }

  /**
   * @logout
   * @summary Cerrar sesión (revoca el token actual)
   * @responseBody 200 - {"message": "Logged out successfully"}
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
  /**
   * @me
   * @summary Obtener usuario autenticado
   * @responseBody 200 - {"user": {"id": "uuid", "fullName": "string", "email": "string", "avatar": "string|null", "emailVerifiedAt": "string|null"}, "enrollment": {"id": "uuid", "role": "user|owner"}}
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async me({ auth, site }: HttpContext) {
    const user = auth.getUserOrFail()

    const enrollment = await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      {
        siteId: site.id,
        userId: user.id,
        role: 'user',
      }
    )
    return { user, enrollment }
  }

  /**
   * @sites
   * @summary Listar los sitios del usuario autenticado con su rol en cada uno (no requiere x-site-id)
   * @responseBody 200 - [{"id": "uuid", "siteId": "uuid", "userId": "uuid", "role": "owner|user", "site": {"id": "uuid", "name": "string", "url": "string", "logo": "string|null", "description": "string|null"}}]
   * @responseBody 401 - {"message": "Unauthorized"}
   */
  async sites({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return Enrollment.query().where('user_id', user.id).preload('site').orderBy('created_at', 'asc')
  }

  /**
   * @getGoogleUrl
   * @summary Obtener URL de autenticación con Google OAuth
   * @paramQuery callbackUrl - URL de callback que Google debe usar para regresar al cliente - @type(string) @required
   * @responseBody 200 - {"url": "https://accounts.google.com/o/oauth2/auth?..."}
   */
  async getGoogleUrl({ ally, request }: HttpContext) {
    const callbackUrl = request.input('callbackUrl')

    return {
      url: await ally.use('google').redirectUrl((googleRequest) => {
        googleRequest.clearParam('redirect_uri')
        googleRequest.param('redirect_uri', callbackUrl)
      }),
    }
  }
  /**
   * @handleCallback
   * @summary Callback de Google OAuth — intercambia el código por token de sesión
   * @paramQuery code - Código de autorización de Google - @type(string) @required
   * @paramQuery callbackUrl - URL de callback usada en el paso inicial de OAuth - @type(string) @required
   * @responseBody 200 - {"user": {"id": "uuid", "fullName": "string", "email": "string", "avatar": "string|null"}, "enrollment": {"id": "uuid", "role": "user|owner"}, "token": "oat_xxxxxxxxxxxx"}
   */
  async handleCallback({ ally, request, site }: HttpContext) {
    const callbackUrl = request.input('callbackUrl')
    const google = ally.use('google').stateless()

    if (google.hasError()) {
      return { error: google.getError() }
    }

    let tokenData: Awaited<ReturnType<typeof google.accessToken>>
    try {
      tokenData = await google.accessToken((tokenRequest) => {
        tokenRequest.clearField('redirect_uri')
        tokenRequest.field('redirect_uri', callbackUrl)
      })
    } catch (error) {
      console.error(
        'Google token exchange error:',
        (error as any)?.response?.body ?? (error as any)?.message ?? error
      )
      throw error
    }

    const googleUser = await google.userFromToken(tokenData.token)

    const user = await User.firstOrCreate(
      { email: googleUser.email },
      {
        fullName: googleUser.name,
        avatar: googleUser.avatarUrl,
        password: Math.random().toString(36).slice(-8),
      }
    )
    user.emailVerifiedAt = DateTime.now()
    await user.save()

    const enrollment = await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      { siteId: site.id, userId: user.id, role: 'user' }
    )

    const token = await User.accessTokens.create(user)

    return {
      user,
      enrollment,
      token: token.value!.release(),
    }
  }
}
