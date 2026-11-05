import { type H3Event, deleteCookie, getCookie, setCookie } from 'h3'

const APPI_TOKEN_COOKIE = 'appi_session_token'
const OAUTH_FLOW_COOKIE = 'appi_oauth_flow'
const OAUTH_FLOW_PATH = '/api/session/oauth'

export type OauthFlow = {
  state: string
  verifier: string
  redirect: string
}

export function getAppiToken(event: H3Event): string | null {
  return getCookie(event, APPI_TOKEN_COOKIE) ?? null
}

export function setAppiToken(event: H3Event, token: string) {
  setCookie(event, APPI_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAppiToken(event: H3Event) {
  deleteCookie(event, APPI_TOKEN_COOKIE, {
    path: '/',
  })
}

export function setOauthFlow(event: H3Event, flow: OauthFlow) {
  setCookie(event, OAUTH_FLOW_COOKIE, JSON.stringify(flow), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: OAUTH_FLOW_PATH,
    maxAge: 60 * 10,
  })
}

/** A flow can only be completed once, whatever its outcome. */
export function consumeOauthFlow(event: H3Event): OauthFlow | null {
  const value = getCookie(event, OAUTH_FLOW_COOKIE)
  deleteCookie(event, OAUTH_FLOW_COOKIE, { path: OAUTH_FLOW_PATH })
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value) as OauthFlow
  } catch {
    return null
  }
}

/** Only paths inside this site: `//host` and `/\host` are other origins to a browser. */
export function safeRedirectPath(value: unknown) {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/'
}

export function oauthCallbackUrl() {
  return `${String(useRuntimeConfig().appUrl).replace(/\/+$/, '')}${OAUTH_FLOW_PATH}/callback`
}
