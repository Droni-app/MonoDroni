import { type H3Event, deleteCookie, getCookie, setCookie } from 'h3'

const APPI_TOKEN_COOKIE = 'appi_session_token'

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
