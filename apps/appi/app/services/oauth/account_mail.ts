import logger from '@adonisjs/core/services/logger'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'
import mail from '@adonisjs/mail/services/main'
import type Site from '#models/site'
import type User from '#models/user'
import { issuer } from '#services/oauth/oauth_service'

/** Connectors can act without a site, and then the account is just a Droni account. */
const DRONI = { name: 'Droni', logo: null }

/**
 * Not awaited: how long a response takes must not tell whether an address has an account,
 * and only some branches send anything.
 */
function send(user: User, site: Site | null, data: Record<string, string | null>) {
  const brand = site ?? DRONI
  mail
    .send((message) => {
      message
        .to(user.email)
        .from('noreply@droni.co', brand.name)
        .subject(`${data.title} - ${brand.name}`)
        .htmlView('emails/account', { ...data, site: brand })
    })
    .catch((error) => logger.error({ err: error }, 'account email'))
}

export function sendVerificationEmail(user: User, site: Site | null) {
  const url = signedUrlFor(
    'oauth.verify_email',
    { id: user.id },
    {
      expiresIn: '1 days',
      prefixUrl: issuer(),
      ...(site ? { qs: { site: site.id } } : {}),
    }
  )
  send(user, site, {
    title: 'Verifica tu correo',
    text: `Hola, ${user.fullName || user.email}. Haz clic en el botón para verificar tu correo y activar tu cuenta.`,
    action: 'Verificar mi cuenta',
    url,
    note: 'Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este correo.',
  })
}

export function sendAccountExistsEmail(user: User, site: Site | null) {
  send(user, site, {
    title: 'Ya tienes una cuenta',
    text: 'Alguien intentó registrarse con este correo, pero ya tienes una cuenta. Inicia sesión normalmente; si no recuerdas tu contraseña, usa "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
    action: null,
    url: null,
    note: 'Si no fuiste tú, puedes ignorar este correo: tu cuenta no cambió.',
  })
}

export function sendPasswordResetEmail(user: User, site: Site | null, token: string) {
  send(user, site, {
    title: 'Recupera tu contraseña',
    text: 'Recibimos una solicitud para cambiar la contraseña de tu cuenta. Haz clic en el botón para elegir una nueva.',
    action: 'Cambiar mi contraseña',
    url: `${issuer()}/oauth/reset-password?token=${encodeURIComponent(token)}`,
    note: 'Este enlace expira en 1 hora y solo funciona una vez. Si no lo pediste, ignora este correo: tu contraseña no cambió.',
  })
}
