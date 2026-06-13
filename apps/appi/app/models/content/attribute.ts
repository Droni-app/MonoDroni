import { ContentAttributeSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ContentPost from '#models/content/post'

export default class ContentAttribute extends ContentAttributeSchema {
  @belongsTo(() => ContentPost, { foreignKey: 'content_post_id' })
  declare content_post: BelongsTo<typeof ContentPost>

  @beforeCreate()
  static assignUuid(attribute: ContentAttribute) {
    attribute.id = attribute.id ?? crypto.randomUUID()
  }
}
