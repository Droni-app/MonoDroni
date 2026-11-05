import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Enrollment from '#models/enrollment'
import OauthAuthorizationCode from '#models/oauth/oauth_authorization_code'
import OauthGrant from '#models/oauth/oauth_grant'
import PasswordResetToken from '#models/password_reset_token'
import Site from '#models/site'
import User from '#models/user'
import { allowAccountEmail, TOO_MANY_ATTEMPTS } from '#services/login_throttle'
import {
  sendAccountExistsEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '#services/oauth/account_mail'
import { affectedRows, generateToken, hashToken } from '#services/oauth/oauth_service'
import {
  accountSignupValidator,
  passwordResetValidator,
  sendVerificationEmailValidator,
} from '#validators/user'
import AuthorizationController, { type AuthorizationRequest } from './authorization_controller.ts'

const PASSWORD_RESET_TTL_MINUTES = 60
const INVALID_LINK = 'Este enlace no es válido o ya expiró. Pide uno nuevo desde iniciar sesión.'
const INVALID_PASSWORD =
  'La contraseña debe tener entre 8 y 32 caracteres y coincidir en ambos campos.'
const CHECK_YOUR_EMAIL = 'Si los datos son correctos, en unos minutos recibirás un correo.'

/**
 * Account pages of the OAuth flow. Replies never reveal whether an address has an account:
 * that's what the identical "sent" screen and the silent per-mailbox limit are for.
 */
export default class AccountsController extends AuthorizationController {
  /**
   * @showSignup
   * @summary Formulario de registro dentro del flujo OAuth
   * @responseBody 200 - Página HTML de registro
   */
  async showSignup(ctx: HttpContext) {
    return this.handleRequest(ctx, ctx.request.parsedUrl.query ?? '', (authRequest) =>
      this.renderSignup(ctx, authRequest)
    )
  }

  /**
   * @signup
   * @summary Crea una cuenta y envía el correo de verificación
   * @responseBody 200 - Página HTML que pide revisar el correo
   * @responseBody 422 - Página HTML de registro con el error
   * @responseBody 429 - Página HTML de registro con el error
   */
  async signup(ctx: HttpContext) {
    const { request } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderExpired(ctx)
    }

    return this.handleRequest(ctx, String(request.input('params') ?? ''), async (authRequest) => {
      const [validationError, data] = await accountSignupValidator.tryValidate(request.all())
      if (validationError) {
        const fields = validationError.messages.map((message: { field: string }) => message.field)
        return this.renderSignup(
          ctx,
          authRequest,
          fields.includes('email') || fields.includes('fullName')
            ? 'Revisa tu nombre y tu correo.'
            : INVALID_PASSWORD,
          422
        )
      }

      const allowance = await allowAccountEmail(request, data.email)
      if (!allowance.ip) {
        return this.renderSignup(ctx, authRequest, TOO_MANY_ATTEMPTS, 429)
      }

      const site = this.requestSite(authRequest)
      const existing = await User.findBy('email', data.email)
      if (existing) {
        // Evens out the time that hashing takes for a new account
        await hash.make(data.password)
        if (allowance.mailbox) {
          if (existing.emailVerifiedAt) {
            sendAccountExistsEmail(existing, site)
          } else {
            sendVerificationEmail(existing, site)
          }
        }
        return this.renderSent(ctx, authRequest)
      }

      const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })
      if (site) {
        await Enrollment.firstOrCreate(
          { siteId: site.id, userId: user.id },
          { siteId: site.id, userId: user.id, role: 'user' }
        )
      }
      if (allowance.mailbox) {
        sendVerificationEmail(user, site)
      }
      return this.renderSent(ctx, authRequest)
    })
  }

  /**
   * @resendVerification
   * @summary Reenvía el correo de verificación
   * @responseBody 200 - Página HTML que pide revisar el correo
   * @responseBody 429 - Página HTML de inicio de sesión con el error
   */
  async resendVerification(ctx: HttpContext) {
    const { request } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderExpired(ctx)
    }

    return this.handleRequest(ctx, String(request.input('params') ?? ''), async (authRequest) => {
      const [validationError, data] = await sendVerificationEmailValidator.tryValidate(
        request.all()
      )
      if (validationError) {
        return this.renderSent(ctx, authRequest)
      }

      const allowance = await allowAccountEmail(request, data.email)
      if (!allowance.ip) {
        return this.renderLogin(ctx, authRequest, TOO_MANY_ATTEMPTS, 429)
      }
      const user = await User.findBy('email', data.email)
      if (allowance.mailbox && user && !user.emailVerifiedAt) {
        sendVerificationEmail(user, this.requestSite(authRequest))
      }
      return this.renderSent(ctx, authRequest)
    })
  }

  /**
   * @verifyEmail
   * @summary Verifica el correo con un enlace firmado
   * @responseBody 200 - Página HTML que confirma la verificación
   * @responseBody 400 - Página HTML de error si el enlace no es válido
   */
  async verifyEmail(ctx: HttpContext) {
    const { params, request } = ctx
    const user = request.hasValidSignature() ? await User.find(params.id) : null
    if (!user) {
      return this.renderError(ctx, INVALID_LINK)
    }

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = DateTime.now()
      await user.save()
    }
    const siteId = request.input('site')
    return this.renderNotice(
      ctx,
      siteId ? await Site.find(siteId) : null,
      'Correo verificado',
      'Tu cuenta está activa. Ya puedes iniciar sesión.'
    )
  }

  /**
   * @showForgotPassword
   * @summary Formulario para pedir el correo de recuperación de contraseña
   * @responseBody 200 - Página HTML con el formulario
   */
  async showForgotPassword(ctx: HttpContext) {
    return this.handleRequest(ctx, ctx.request.parsedUrl.query ?? '', (authRequest) =>
      this.renderForgotPassword(ctx, authRequest)
    )
  }

  /**
   * @forgotPassword
   * @summary Envía el correo de recuperación de contraseña
   * @responseBody 200 - Página HTML que pide revisar el correo
   * @responseBody 429 - Página HTML con el error
   */
  async forgotPassword(ctx: HttpContext) {
    const { request } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderExpired(ctx)
    }

    return this.handleRequest(ctx, String(request.input('params') ?? ''), async (authRequest) => {
      const [validationError, data] = await sendVerificationEmailValidator.tryValidate(
        request.all()
      )
      if (validationError) {
        return this.renderForgotPassword(ctx, authRequest, 'Escribe un correo válido.', 422)
      }

      const allowance = await allowAccountEmail(request, data.email)
      if (!allowance.ip) {
        return this.renderForgotPassword(ctx, authRequest, TOO_MANY_ATTEMPTS, 429)
      }
      const user = await User.findBy('email', data.email)
      if (allowance.mailbox && user) {
        const site = this.requestSite(authRequest)
        const token = generateToken()
        // Only the latest link works
        await PasswordResetToken.query().where('user_id', user.id).delete()
        await PasswordResetToken.create({
          tokenHash: hashToken(token),
          userId: user.id,
          siteId: site?.id ?? null,
          expiresAt: DateTime.now().plus({ minutes: PASSWORD_RESET_TTL_MINUTES }),
        })
        sendPasswordResetEmail(user, site, token)
      }
      return this.renderSent(ctx, authRequest)
    })
  }

  /**
   * @showResetPassword
   * @summary Formulario para elegir una contraseña nueva
   * @responseBody 200 - Página HTML con el formulario
   * @responseBody 400 - Página HTML de error si el enlace no es válido
   */
  async showResetPassword(ctx: HttpContext) {
    const token = String(ctx.request.input('token') ?? '')
    const row = await this.findResetToken(token)
    return row ? this.renderReset(ctx, row, token) : this.renderError(ctx, INVALID_LINK)
  }

  /**
   * @resetPassword
   * @summary Cambia la contraseña y revoca todo lo emitido con la anterior
   * @responseBody 200 - Página HTML que confirma el cambio
   * @responseBody 400 - Página HTML de error si el enlace no es válido
   * @responseBody 422 - Página HTML con el error
   */
  async resetPassword(ctx: HttpContext) {
    const { request } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderExpired(ctx)
    }
    const token = String(request.input('token') ?? '')
    const row = await this.findResetToken(token)
    if (!row) {
      return this.renderError(ctx, INVALID_LINK)
    }

    const [validationError, data] = await passwordResetValidator.tryValidate(request.all())
    if (validationError) {
      return this.renderReset(ctx, row, token, INVALID_PASSWORD, 422)
    }

    const changed = await db.transaction(async (trx) => {
      const now = DateTime.now().toSQL({ includeOffset: false })
      const claimed = await PasswordResetToken.query({ client: trx })
        .where('id', row.id)
        .whereNull('used_at')
        .update({ used_at: now })
      if (affectedRows(claimed) !== 1) {
        return false
      }

      const user = await User.findOrFail(row.userId, { client: trx })
      user.password = data.password
      // Only the owner of the mailbox could get here
      user.emailVerifiedAt ??= DateTime.now()
      await user.save()

      // If the password leaked, whoever took it must not keep a way in
      await trx.from('auth_access_tokens').where('tokenable_id', user.id).delete()
      await OauthGrant.query({ client: trx }).where('user_id', user.id).update({ revoked_at: now })
      await OauthAuthorizationCode.query({ client: trx }).where('user_id', user.id).delete()
      return true
    })
    if (!changed) {
      return this.renderError(ctx, INVALID_LINK)
    }

    return this.renderNotice(
      ctx,
      row.siteId ? await Site.find(row.siteId) : null,
      'Contraseña actualizada',
      'Ya puedes iniciar sesión con tu contraseña nueva. Cerramos tus sesiones abiertas y desconectamos tus aplicaciones.'
    )
  }

  private findResetToken(token: string) {
    return PasswordResetToken.query()
      .where('token_hash', hashToken(token))
      .whereNull('used_at')
      .where('expires_at', '>', DateTime.now().toSQL({ includeOffset: false }))
      .first()
  }

  private renderExpired(ctx: HttpContext) {
    return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a intentarlo.')
  }

  private renderSignup(
    ctx: HttpContext,
    authRequest: AuthorizationRequest,
    error?: string,
    status = 200
  ) {
    return this.render(ctx, status, {
      screen: 'signup',
      heading: 'Crea tu cuenta',
      error,
      fullName: ctx.request.input('fullName'),
      email: ctx.request.input('email'),
      ...this.consentData(ctx, authRequest),
    })
  }

  private renderForgotPassword(
    ctx: HttpContext,
    authRequest: AuthorizationRequest,
    error?: string,
    status = 200
  ) {
    return this.render(ctx, status, {
      screen: 'forgot',
      heading: 'Recupera tu contraseña',
      error,
      email: ctx.request.input('email'),
      ...this.consentData(ctx, authRequest),
    })
  }

  private renderSent(ctx: HttpContext, authRequest: AuthorizationRequest) {
    return this.render(ctx, 200, {
      screen: 'sent',
      heading: 'Revisa tu correo',
      text: CHECK_YOUR_EMAIL,
      ...this.consentData(ctx, authRequest),
    })
  }

  private async renderReset(
    ctx: HttpContext,
    row: PasswordResetToken,
    token: string,
    error?: string,
    status = 200
  ) {
    return this.render(ctx, status, {
      screen: 'reset',
      error,
      token,
      csrf: this.csrfToken(ctx),
      site: this.siteData(row.siteId ? await Site.find(row.siteId) : null),
    })
  }

  private renderNotice(ctx: HttpContext, site: Site | null, heading: string, text: string) {
    return this.render(ctx, 200, { screen: 'notice', heading, text, site: this.siteData(site) })
  }
}
