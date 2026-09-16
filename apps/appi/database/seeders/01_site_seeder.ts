import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Site from '#models/site'
import User from '#models/user'
import Enrollment from '#models/enrollment'
export default class SiteSeeder extends BaseSeeder {
  async run() {
    const site = await Site.updateOrCreate(
      { name: 'Dronico' },
      {
        id: '4ebaccf5-b863-4f12-aa49-9bbe0e1844e2',
        name: 'Dronico',
        url: 'https://droni.co',
      }
    )
    const user = await User.firstOrCreate(
      { email: 'dev@droni.co' },
      {
        fullName: 'Gustavo Barragan',
        email: 'dev@droni.co',
        password: 'password',
      }
    )

    const student = await User.firstOrCreate(
      { email: 'student@droni.co' },
      {
        fullName: 'Gustavo Barragan',
        email: 'student@droni.co',
        password: 'password',
      }
    )

    await Enrollment.updateOrCreate(
      { siteId: site.id, userId: user.id },
      {
        id: '4ebaccf5-b863-4f12-aa49-9bbe0e1844e2',
        siteId: site.id,
        userId: user.id,
        role: 'owner',
      }
    )

    await Enrollment.updateOrCreate(
      { siteId: site.id, userId: user.id },
      {
        id: '4ebaccf5-b863-4f12-aa49-9bbe0e1844e2',
        siteId: site.id,
        userId: student.id,
        role: 'user',
      }
    )
  }
}
