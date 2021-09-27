import { Request, Response } from 'express'
import { BaseController } from './base'

export default class HealthController extends BaseController {
  initRoutes() {
    this.handleUrl('get', '/health', this.health)
  }

  health(_req: Request, res: Response) {
    res.json({
      status: 'ok',
      dt: new Date()
    })
  }
}
