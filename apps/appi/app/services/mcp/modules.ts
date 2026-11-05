import type { AppiCall } from '#services/mcp/appi_client'
import type { ToolServer } from '#services/mcp/shared'
import { registerContentTools } from '#services/mcp/content_tools'
import { registerSocialTools } from '#services/mcp/social_tools'
import { registerStoreAdminTools, registerStoreTools } from '#services/mcp/store_tools'
import { registerLearnAdminTools, registerLearnTools } from '#services/mcp/learn_tools'

type RegisterTools = (server: ToolServer, call: AppiCall) => void

const domainModules: Record<string, RegisterTools> = {
  'content': registerContentTools,
  'social': registerSocialTools,
  'store': registerStoreTools,
  'store-admin': registerStoreAdminTools,
  'learn': registerLearnTools,
  'learn-admin': registerLearnAdminTools,
}

export const ALL_MODULES = 'all'

/**
 * One MCP server per domain module, served at POST /mcp/:siteId/:module (one site)
 * and POST /mcp/:module (multi-site: every tool takes site_id).
 * store and learn are split into a public/user server and an owner-only
 * `-admin` one to keep each server's tool list short.
 * `all` serves every tool for clients that want a single connector; tool names must stay
 * unique across modules, since the SDK throws on a duplicate.
 */
export const mcpModules: Record<string, RegisterTools> = {
  ...domainModules,
  [ALL_MODULES]: (server, call) => {
    for (const register of Object.values(domainModules)) {
      register(server, call)
    }
  },
}
