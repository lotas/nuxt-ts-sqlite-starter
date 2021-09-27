import express, { Router } from 'express'
import helmet from 'helmet'
import controllers from './controllers'
import logger from './utils/logger'

const availableRoutesString = (router: Router) => router.stack
  .filter(r => r.route)
  .map(r => Object.keys(r.route.methods)[0].toUpperCase().padEnd(7) + r.route.path)
  .join('\n  ')

const server = express()

server.disable('x-powered-by')
server.use(helmet())

server.use(
  (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    logger.info('API request', {
      method: req.method,
      url: req.url,
      ua: req.headers['sec-ch-ua'],
      'user-agent': req.headers['user-agent'],
    })
    next()
  }
)

controllers.forEach(controller => {
  server.use(controller.router)
  logger.info(availableRoutesString(controller.router))
})

server.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('API Error', {
      method: req.method,
      url: req.url,
      error: err.message,
    })
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.json({ error: err })
  }
)

export default server
