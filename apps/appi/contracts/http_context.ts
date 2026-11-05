import type Site from '#models/site'
import type { LoopbackCredential } from '#services/mcp/loopback_credential'
declare module '@adonisjs/core/http' {
  interface HttpContext {
    site: Site
    mcpCredential: LoopbackCredential
  }
}
