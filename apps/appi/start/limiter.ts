/*
|--------------------------------------------------------------------------
| HTTP limiters
|--------------------------------------------------------------------------
|
| Logins and the account pages are limited in app/services/login_throttle.ts,
| since they answer with HTML and only some of their outcomes count.
|
*/

import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import limiter from '@adonisjs/limiter/services/main'
import { clientIp, TOO_MANY_ATTEMPTS } from '#services/login_throttle'
import env from '#start/env'

if (app.inProduction && !env.get('CLIENT_IP_HEADER')) {
  logger.warn('CLIENT_IP_HEADER is not set: behind a proxy, all clients share one rate limit')
}

export const clientRegistrationThrottle = limiter.define('client_registration', ({ request }) =>
  limiter
    .allowRequests(30)
    .every('1 hour')
    .usingKey(clientIp(request))
    .limitExceeded((error) => error.setMessage(TOO_MANY_ATTEMPTS))
)
