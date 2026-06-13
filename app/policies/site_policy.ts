import Enrollment from '#models/enrollment'
import Site from '#models/site'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class SitePolicy extends BasePolicy {
  private async isOwner(user: User, site: Site): Promise<boolean> {
    const enrollment = await Enrollment.query()
      .where('userId', user.id)
      .where('siteId', site.id)
      .where('role', 'owner')
      .first()

    return enrollment !== null
  }

  async edit(user: User, site: Site): Promise<AuthorizerResponse> {
    return this.isOwner(user, site)
  }

  async destroy(user: User, site: Site): Promise<AuthorizerResponse> {
    return this.isOwner(user, site)
  }
}
