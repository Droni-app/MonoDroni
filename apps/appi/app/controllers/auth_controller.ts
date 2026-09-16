import { loginValidator, signupValidator, sendVerificationEmailValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'
import User from '#models/user'
import Enrollment from '#models/enrollment'
import { DateTime } from 'luxon'
import Site from '#models/site'

export default class AuthController {
  /**
   * @register
   * @summary Registro de nuevo usuario
   * @requestBody {"fullName": "string", "email": "user@example.com", "password": "password123", "passwordConfirmation": "password123"}
   * @responseBody 201 - {"user": {"id": "uuid", "fullName": "string", "email": "string", "avatar": "string|null", "createdAt": "string"}, "enrollment": {"id": "uuid", "siteId": "string", "userId": "uuid", "role": "user", "createdAt": "string"}}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async register({ request, site }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const user = await User.create({ fullName, email, password })
    const enrollment = await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      {
        siteId: site.id,
        userId: user.id,
        role: 'user',
      }
    )

    const verificationUrl = signedUrlFor(
      'auth.validate',
      {
        enrollmentId: enrollment.id,
      },
      {
        expiresIn: '1 days',
        prefixUrl: process.env.APP_URL,
      }
    )

    await mail.send((message) => {
      message
        .to(user.email)
        .from('noreply@droni.co', site.name)
        .subject(`Bienvenido a ${site.name}`)
        .htmlView('emails/welcome', { user, site, verificationUrl })
    })

    return {
      user: user,
      enrollment: enrollment,
    }
  }

  /**
   * @sendVerificationEmail
   * @summary Reenviar email de verificación
   * @requestBody {"email": "user@example.com"}
   * @responseBody 200 - {"message": "Verification email sent. Please check your inbox."}
   * @responseBody 404 - {"message": "Row not found"}
   */
  async sendVerificationEmail({ request, site }: HttpContext) {
    const { email } = await request.validateUsing(sendVerificationEmailValidator)
    const user = await User.findByOrFail('email', email)
    const enrollment = await Enrollment.firstOrCreate(
      { siteId: site.id, userId: user.id },
      {
        siteId: site.id,
        userId: user.id,
        role: 'user',
      }
    )

    const verificationUrl = signedUrlFor(
      'auth.validate',
      {
        enrollmentId: enrollment.id,
      },
      {
        expiresIn: '1 days',
        prefixUrl: process.env.APP_URL,
      }
    )

    await mail.send((message) => {
      message
        .to(user.email)
        .from('noreply@droni.co', site.name)
        .subject(`Bienvenido a ${site.name}`)
        .htmlView('emails/welcome', { user, site, verificationUrl })
    })

    return {
      message: 'Verification email sent. Please check your inbox.',
    }
  }

  /**
   * @verifyEmail
   * @summary Verificar email con enlace firmado
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

    return response.redirect(site.url)
  }

  /**
   * @login
   * @summary Iniciar sesión
   * @requestBody {"email": "user@example.com", "password": "password123"}
   * @responseBody 200 - {"user": {"id": "uuid", "fullName": "string", "email": "string", "avatar": "string|null"}, "enrollment": {"id": "uuid", "role": "user|owner"}, "token": "oat_xxxxxxxxxxxx"}
   * @responseBody 400 - {"message": "Email not verified."}
   * @responseBody 422 - {"errors": [{"message": "string", "field": "string"}]}
   */
  async login({ request, site, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
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
