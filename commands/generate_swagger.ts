import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { writeFileSync } from 'node:fs'

export default class GenerateSwagger extends BaseCommand {
  static commandName = 'swagger:generate'
  static description = 'Generate swagger.yml for production serving'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const router = await this.app.container.make('router')
    router.commit()
    let spec = await AutoSwagger.default.docs(router.toJSON(), swagger)
    spec = spec.replace(/    BasicAuth:\n      type: "http"\n      scheme: "basic"\n/g, '')
    spec = spec.replace(/    ApiKeyAuth:\n      type: "apiKey"\n      in: "header"\n      name: "X-API-Key"\n/g, '')
    writeFileSync('./swagger.yml', spec)
    this.logger.success('swagger.yml generated successfully')
  }
}
