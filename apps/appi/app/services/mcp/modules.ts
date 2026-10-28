import type { AppiCall } from '#services/mcp/appi_client'
import type { ToolServer } from '#services/mcp/shared'
import { registerContentTools } from '#services/mcp/content_tools'
import { registerSocialTools } from '#services/mcp/social_tools'
import { registerStoreAdminTools, registerStoreTools } from '#services/mcp/store_tools'
import { registerLearnAdminTools, registerLearnTools } from '#services/mcp/learn_tools'

/**
 * One MCP server per domain module, served at POST /mcp/:siteId/:module (one site)
 * and POST /mcp/:module (multi-site: every tool takes site_id).
 * store and learn are split into a public/user server and an owner-only
 * `-admin` one to keep each server's tool list short.
 */
export const mcpModules: Record<string, (server: ToolServer, call: AppiCall) => void> = {
  'content': registerContentTools,
  'social': registerSocialTools,
  'store': registerStoreTools,
  'store-admin': registerStoreAdminTools,
  'learn': registerLearnTools,
  'learn-admin': registerLearnAdminTools,
}
