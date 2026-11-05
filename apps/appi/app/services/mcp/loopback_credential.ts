import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export type LoopbackCredential = {
  bearer: () => Promise<string>
  revoke: () => Promise<void>
}

/**
 * A connector's OAuth token is only valid on the MCP routes and is never passed on, so
 * tool calls replay against appi with a separate api token that never leaves this
 * server. It's minted on the first tool call and removed when the MCP request ends; the
 * short expiry only matters if the process dies before that.
 */
export function loopbackCredential(user: User): LoopbackCredential {
  let minted: ReturnType<typeof User.accessTokens.create> | undefined

  return {
    bearer: async () => {
      minted ??= User.accessTokens.create(user, ['*'], {
        name: 'mcp-loopback',
        expiresIn: '5 minutes',
      })
      const token = await minted
      return token.value!.release()
    },
    revoke: async () => {
      if (minted) {
        const token = await minted
        await User.accessTokens.delete(user, token.identifier)
      }
    },
  }
}

export function revokeLoopbackCredential({ mcpCredential, logger }: HttpContext) {
  mcpCredential.revoke().catch((error) => logger.error({ err: error }, 'mcp loopback revoke'))
}
