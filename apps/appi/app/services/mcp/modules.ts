import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AppiCall } from '#services/mcp/appi_client'
import { registerContentTools } from '#services/mcp/content_tools'

/**
 * One MCP server per domain module, served at POST /mcp/:siteId/:module.
 * Add learn/social/store here as their tool files are written.
 */
export const mcpModules: Record<string, (server: McpServer, call: AppiCall) => void> = {
  content: registerContentTools,
}
