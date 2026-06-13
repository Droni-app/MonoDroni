import { ContentAttachmentSchema } from '#database/schema'
import env from '#start/env'
import { beforeCreate, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'

export default class ContentAttachment extends ContentAttachmentSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @computed()
  get url(): string {
    const bucket = env.get('SPACES_BUCKET')
    const region = env.get('SPACES_REGION')
    return `https://${bucket}.${region}.digitaloceanspaces.com/${this.path}`
  }

  @beforeCreate()
  static assignUuid(attachment: ContentAttachment) {
    attachment.id = attachment.id ?? crypto.randomUUID()
  }
}
