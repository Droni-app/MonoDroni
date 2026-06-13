import type Site from '#models/site'
declare module '@adonisjs/core/http' {
  interface HttpContext {
    site: Site
  }
}
