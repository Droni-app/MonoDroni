import { createHash } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import env from '#start/env'

export const TOO_MANY_ATTEMPTS = 'Demasiados intentos. Vuelve a intentarlo más tarde.'

/**
 * Without CLIENT_IP_HEADER this is the socket's address, which behind a proxy is the proxy's:
 * everyone would share one limit. x-forwarded-for isn't used because it's client-supplied
 * unless every hop is known, and App Platform doesn't publish its ingress ranges.
 */
export function clientIp(request: HttpContext['request']) {
  const header = env.get('CLIENT_IP_HEADER')
  return (header && request.header(header)?.trim()) || request.ip()
}

/** Keys have a length limit and shouldn't leave email addresses in the limits table. */
export function emailKey(email: unknown) {
  return createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex')
}

/**
 * Pages that send email from a public form. The IP limit shows; the mailbox one doesn't,
 * since "too many emails to this address" would reveal that it has an account.
 */
export async function allowAccountEmail(request: HttpContext['request'], email: string) {
  const byIp = limiter.use({ requests: 20, duration: '1 hour' })
  const byMailbox = limiter.use({ requests: 3, duration: '1 hour' })
  return {
    ip: !!(await byIp.attempt(`account_email_ip_${clientIp(request)}`, () => true)),
    mailbox: !!(await byMailbox.attempt(`account_email_${emailKey(email)}`, () => true)),
  }
}

/**
 * Only failures count. An account's counter is tied to the IP so that nobody can lock
 * someone else out, and it resets on success; the IP's doesn't, or a login with an
 * attacker's own account would wipe its count of guesses at other accounts.
 */
export async function verifyLogin(
  request: HttpContext['request'],
  email: string,
  password: string
) {
  const ip = clientIp(request)
  const byIp = limiter.use({ requests: 30, duration: '15 minutes' })
  const byAccount = limiter.use({
    requests: 5,
    duration: '15 minutes',
    blockDuration: '15 minutes',
  })
  const ipKey = `login_ip_${ip}`

  const ipState = await byIp.get(ipKey)
  if (ipState && ipState.remaining <= 0) {
    throw new errors.E_TOO_MANY_REQUESTS(ipState).setMessage(TOO_MANY_ATTEMPTS)
  }

  const [error, user] = await byAccount.penalize(
    `login_account_${ip}_${emailKey(email)}`,
    async () => {
      try {
        return await User.verifyCredentials(email, password)
      } catch (failure) {
        await byIp.increment(ipKey)
        throw failure
      }
    }
  )
  if (error) {
    throw error.setMessage(TOO_MANY_ATTEMPTS)
  }
  return user
}
