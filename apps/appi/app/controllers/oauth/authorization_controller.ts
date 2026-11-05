import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/limiter'
import { DateTime } from 'luxon'
import OauthAuthorizationCode from '#models/oauth/oauth_authorization_code'
import OauthClient from '#models/oauth/oauth_client'
import type Site from '#models/site'
import User from '#models/user'
import { loginValidator } from '#validators/user'
import { TOO_MANY_ATTEMPTS, verifyLogin } from '#services/login_throttle'
import { ALL_MODULES } from '#services/mcp/modules'
import {
  isMetadataDocumentUrl,
  resolveMetadataDocumentClient,
} from '#services/oauth/client_metadata_document'
import {
  AUTHORIZATION_CODE_TTL_MINUTES,
  FIRST_PARTY_CLIENT,
  FIRST_PARTY_SCOPE,
  generateToken,
  hashToken,
  isLoopbackRedirect,
  issuer,
  OAUTH_SCOPE,
  parseResource,
  redirectUriMatches,
  safeEqual,
  type McpResource,
} from '#services/oauth/oauth_service'

export type AuthorizationRequest = {
  client: OauthClient
  redirectUri: string
  state: string | null
  codeChallenge: string
  resource: McpResource | null
  query: string
}

/**
 * Parses the raw query string, which the login and consent forms carry along untouched.
 * Repeated parameters are invalid in OAuth, and last-one-wins would hide them.
 */
function parseParams(query: string) {
  const params = new URLSearchParams(query)
  const unique = new Set(params.keys())
  return { params, hasDuplicates: unique.size !== [...params.keys()].length }
}

export default class AuthorizationController {
  /**
   * @show
   * @summary Pantalla de inicio de sesión y consentimiento del flujo OAuth
   * @responseBody 200 - Página HTML de login o consentimiento
   * @responseBody 302 - Redirige al cliente con un error OAuth
   * @responseBody 400 - Página HTML de error si el cliente o redirect_uri no son válidos
   */
  async show(ctx: HttpContext) {
    return this.handleRequest(ctx, ctx.request.parsedUrl.query ?? '', (authRequest) =>
      this.renderForUser(ctx, authRequest)
    )
  }

  /**
   * @decide
   * @summary Registra la decisión de consentimiento y redirige al cliente
   * @responseBody 303 - Redirige al redirect_uri del cliente con code o error
   */
  async decide(ctx: HttpContext) {
    const { auth, request, response } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a iniciar la conexión.')
    }

    return this.handleRequest(ctx, String(request.input('params') ?? ''), async (authRequest) => {
      if (authRequest.client.type === FIRST_PARTY_CLIENT || !(await this.hasSession(ctx))) {
        return this.renderForUser(ctx, authRequest)
      }
      if (request.input('decision') !== 'allow') {
        return response.redirect(
          this.errorRedirectUrl(authRequest, 'access_denied', 'The user denied access'),
          false,
          303
        )
      }

      return this.redirectWithCode(ctx, authRequest, auth.use('web').user!.id)
    })
  }

  /**
   * @login
   * @summary Inicia sesión con email y contraseña dentro del flujo OAuth
   * @responseBody 303 - Vuelve a la pantalla de consentimiento
   * @responseBody 200 - Página de login con el error
   */
  async login(ctx: HttpContext) {
    const { request, response } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a iniciar la conexión.')
    }

    return this.handleRequest(ctx, String(request.input('params') ?? ''), async (authRequest) => {
      let user: User
      try {
        const { email, password } = await loginValidator.validate(request.all())
        user = await verifyLogin(request, email, password)
      } catch (error) {
        if (error instanceof errors.E_TOO_MANY_REQUESTS) {
          response.header('Retry-After', error.response.availableIn)
          return this.renderLogin(ctx, authRequest, TOO_MANY_ATTEMPTS, 429)
        }
        return this.renderLogin(ctx, authRequest, 'Correo o contraseña incorrectos.')
      }
      if (!user.emailVerifiedAt) {
        return this.renderLogin(
          ctx,
          authRequest,
          'Debes verificar tu correo antes de continuar.',
          200,
          user.email
        )
      }

      return this.completeLogin(ctx, authRequest, user)
    })
  }

  /**
   * @logout
   * @summary Cierra la sesión del flujo OAuth para entrar con otra cuenta
   * @responseBody 303 - Vuelve a la pantalla de login
   */
  async logout(ctx: HttpContext) {
    const { auth, request, response } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a iniciar la conexión.')
    }
    await auth.use('web').logout()
    const query = parseParams(String(request.input('params') ?? '')).params.toString()
    return response.redirect(`/oauth/authorize?${query}`, false, 303)
  }

  /**
   * @google
   * @summary Inicia el login con Google dentro del flujo OAuth
   * @responseBody 302 - Redirige a Google
   */
  async google(ctx: HttpContext) {
    const { ally, request, session } = ctx
    if (!this.hasValidCsrf(ctx)) {
      return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a iniciar la conexión.')
    }

    session.put('oauth.pending', String(request.input('params') ?? ''))
    return ally.use('google').redirect((googleRequest) => {
      googleRequest.clearParam('redirect_uri')
      googleRequest.param('redirect_uri', `${issuer()}/oauth/google/callback`)
    })
  }

  /**
   * @googleCallback
   * @summary Callback de Google para el flujo OAuth
   * @responseBody 303 - Vuelve a la pantalla de consentimiento
   */
  async googleCallback(ctx: HttpContext) {
    const { ally, session } = ctx
    const pending = session.pull('oauth.pending')
    if (typeof pending !== 'string') {
      return this.renderError(ctx, 'La sesión de esta página expiró. Vuelve a iniciar la conexión.')
    }

    const retry = 'No pudimos iniciar sesión con Google. Vuelve a intentarlo.'
    const google = ally.use('google')
    if (google.accessDenied() || google.stateMisMatch() || google.hasError()) {
      return this.handleRequest(ctx, pending, (authRequest) =>
        this.renderLogin(ctx, authRequest, retry)
      )
    }

    let user: User
    try {
      const { token } = await google.accessToken((tokenRequest) => {
        tokenRequest.clearField('redirect_uri')
        tokenRequest.field('redirect_uri', `${issuer()}/oauth/google/callback`)
      })
      const googleUser = await google.userFromToken(token)
      // An unverified Google email must not be able to log into the account that owns it
      if (googleUser.emailVerificationState !== 'verified') {
        return this.handleRequest(ctx, pending, (authRequest) =>
          this.renderLogin(ctx, authRequest, retry)
        )
      }
      user = await User.firstOrCreate(
        { email: googleUser.email },
        {
          fullName: googleUser.name,
          avatar: googleUser.avatarUrl,
          password: generateToken(),
        }
      )
    } catch (error) {
      ctx.logger.error({ err: error }, 'oauth google login')
      return this.handleRequest(ctx, pending, (authRequest) =>
        this.renderLogin(ctx, authRequest, retry)
      )
    }
    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = DateTime.now()
      await user.save()
    }

    return this.handleRequest(ctx, pending, (authRequest) =>
      this.completeLogin(ctx, authRequest, user)
    )
  }

  /**
   * Connectors go on to the consent screen. A first-party client gets its code right away
   * and no session here: the user's session lives in the client, and one left here would
   * log them straight back in after they log out there.
   */
  private async completeLogin(ctx: HttpContext, authRequest: AuthorizationRequest, user: User) {
    if (authRequest.client.type === FIRST_PARTY_CLIENT) {
      return this.redirectWithCode(ctx, authRequest, user.id)
    }
    await ctx.auth.use('web').login(user)
    ctx.session.put('oauth.credential', hashToken(user.password))
    return ctx.response.redirect(`/oauth/authorize?${authRequest.query}`, false, 303)
  }

  /**
   * Sessions live in cookies and can't be revoked from the server. Tying them to the password
   * ends them when it changes, or whoever stole it could keep authorizing connectors.
   */
  private async hasSession(ctx: HttpContext) {
    const web = ctx.auth.use('web')
    if (!(await web.check())) {
      return false
    }
    const credential = ctx.session.get('oauth.credential')
    if (credential && !safeEqual(credential, hashToken(web.user!.password))) {
      await web.logout()
      return false
    }
    return true
  }

  private async redirectWithCode(
    { response }: HttpContext,
    authRequest: AuthorizationRequest,
    userId: string
  ) {
    const firstParty = authRequest.client.type === FIRST_PARTY_CLIENT
    const code = generateToken()
    await OauthAuthorizationCode.create({
      codeHash: hashToken(code),
      clientId: authRequest.client.id,
      userId,
      redirectUri: authRequest.redirectUri,
      codeChallenge: authRequest.codeChallenge,
      resource: firstParty ? null : (authRequest.resource?.url ?? null),
      scope: firstParty ? FIRST_PARTY_SCOPE : OAUTH_SCOPE,
      expiresAt: DateTime.now().plus({ minutes: AUTHORIZATION_CODE_TTL_MINUTES }),
    })

    const url = new URL(authRequest.redirectUri)
    url.searchParams.set('code', code)
    if (authRequest.state) {
      url.searchParams.set('state', authRequest.state)
    }
    url.searchParams.set('iss', issuer())
    return response.redirect(url.href, false, 303)
  }

  /**
   * RFC 6749 §4.1.2.1: without a trustworthy client and redirect_uri the error can only be
   * shown here. Past that point errors go back to the client, which is the one that can act.
   */
  protected async handleRequest(
    ctx: HttpContext,
    query: string,
    next: (authRequest: AuthorizationRequest) => unknown
  ) {
    const { params, hasDuplicates } = parseParams(query)
    if (hasDuplicates) {
      return this.renderError(ctx, 'La solicitud de autorización no es válida.')
    }

    const clientId = params.get('client_id') ?? ''
    const client = isMetadataDocumentUrl(clientId)
      ? await resolveMetadataDocumentClient(clientId)
      : clientId.startsWith('https://')
        ? null
        : await OauthClient.find(clientId)
    if (!client) {
      return this.renderError(ctx, 'La aplicación que solicita acceso no es válida.')
    }
    if (client.siteId) {
      await client.load('site')
    }

    const redirectUri = params.get('redirect_uri') ?? ''
    if (!redirectUriMatches(client.redirectUris, redirectUri)) {
      return this.renderError(ctx, 'La dirección de retorno de esta aplicación no es válida.')
    }

    const authRequest = {
      client,
      redirectUri,
      state: params.get('state'),
      codeChallenge: params.get('code_challenge') ?? '',
      resource: null as McpResource | null,
      query: params.toString(),
    }

    if (params.get('response_type') !== 'code') {
      return this.redirectError(
        ctx,
        authRequest,
        'unsupported_response_type',
        'Use response_type=code'
      )
    }
    if (
      params.get('code_challenge_method') !== 'S256' ||
      !/^[A-Za-z0-9\-_]{43}$/.test(authRequest.codeChallenge)
    ) {
      return this.redirectError(ctx, authRequest, 'invalid_request', 'PKCE with S256 is required')
    }
    const resource = params.get('resource')
    if (resource) {
      authRequest.resource = await parseResource(resource)
      if (!authRequest.resource) {
        return this.redirectError(ctx, authRequest, 'invalid_target', 'Unknown resource')
      }
    }

    return next(authRequest)
  }

  private async renderForUser(ctx: HttpContext, authRequest: AuthorizationRequest) {
    if (authRequest.client.type !== FIRST_PARTY_CLIENT && (await this.hasSession(ctx))) {
      return this.render(ctx, 200, { screen: 'consent', ...this.consentData(ctx, authRequest) })
    }
    return this.renderLogin(ctx, authRequest)
  }

  protected renderLogin(
    ctx: HttpContext,
    authRequest: AuthorizationRequest,
    error?: string,
    status = 200,
    unverifiedEmail?: string
  ) {
    return this.render(ctx, status, {
      screen: 'login',
      error,
      unverifiedEmail,
      ...this.consentData(ctx, authRequest),
    })
  }

  protected renderError(ctx: HttpContext, error: string) {
    return this.render(ctx, 400, { screen: 'error', error })
  }

  protected consentData(ctx: HttpContext, authRequest: AuthorizationRequest) {
    const { client, redirectUri, resource, query } = authRequest
    const redirect = new URL(redirectUri)
    const firstParty = client.type === FIRST_PARTY_CLIENT
    return {
      firstParty,
      backUrl: firstParty
        ? this.errorRedirectUrl(authRequest, 'access_denied', 'The user went back')
        : null,
      csrf: this.csrfToken(ctx),
      params: query,
      user: ctx.auth.use('web').user,
      clientName: client.name,
      // The name is self-declared; a metadata document's host is the only verified identity
      clientHost: client.type === 'metadata_document' ? new URL(client.id).hostname : null,
      redirectHost: redirect.hostname || redirect.protocol,
      isLoopback: isLoopbackRedirect(redirectUri),
      module: resource?.module === ALL_MODULES ? null : (resource?.module ?? null),
      // A first-party client is its site. A connector is not: anyone can register one and
      // point it at any site, so its site only ever reads as what access is being asked to
      site: this.siteData(this.requestSite(authRequest)),
    }
  }

  /** The site an account created in this request belongs to, or the one being asked for. */
  protected requestSite({ client, resource }: AuthorizationRequest) {
    return (client.type === FIRST_PARTY_CLIENT ? client.site : resource?.site) ?? null
  }

  protected siteData(site?: Site | null) {
    if (!site) {
      return null
    }
    let host: string | null = null
    try {
      const url = new URL(site.url)
      host = /^https?:$/.test(url.protocol) ? url.hostname : null
    } catch {}
    return {
      name: site.name,
      description: site.description,
      host,
      // Free text in the database; the page's CSP only loads https images
      logo: site.logo?.startsWith('https://') ? site.logo : null,
      url: host ? site.url : null,
      initial: site.name.charAt(0).toUpperCase(),
    }
  }

  protected csrfToken({ session }: HttpContext) {
    let token = session.get('oauth.csrf')
    if (!token) {
      token = generateToken()
      session.put('oauth.csrf', token)
    }
    return token
  }

  protected hasValidCsrf({ request, session }: HttpContext) {
    const expected = session.get('oauth.csrf')
    const received = request.input('_csrf')
    return (
      typeof expected === 'string' && typeof received === 'string' && safeEqual(expected, received)
    )
  }

  private errorRedirectUrl(
    authRequest: Pick<AuthorizationRequest, 'redirectUri' | 'state'>,
    error: string,
    description: string
  ) {
    const url = new URL(authRequest.redirectUri)
    url.searchParams.set('error', error)
    url.searchParams.set('error_description', description)
    if (authRequest.state) {
      url.searchParams.set('state', authRequest.state)
    }
    url.searchParams.set('iss', issuer())
    return url.href
  }

  private redirectError(
    { response }: HttpContext,
    authRequest: Pick<AuthorizationRequest, 'redirectUri' | 'state'>,
    error: string,
    description: string
  ) {
    return response.redirect(this.errorRedirectUrl(authRequest, error, description), false)
  }

  protected async render(
    { response, view }: HttpContext,
    status: number,
    data: Record<string, unknown>
  ) {
    // No form-action: browsers apply it to the redirect back to the client after the consent POST
    response.header(
      'Content-Security-Policy',
      "default-src 'none'; style-src 'unsafe-inline'; img-src https:; frame-ancestors 'none'; base-uri 'none'"
    )
    response.header('Cache-Control', 'no-store')
    response.header('Referrer-Policy', 'no-referrer')
    response.status(status)
    return view.render('oauth/page', data)
  }
}
