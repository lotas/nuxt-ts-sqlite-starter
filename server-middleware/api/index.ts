import express from 'express'
import helmet from 'helmet'
import logger from './utils/logger'

import health from './routes/health'
import users from './routes/users'

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

server.use('/health', health)
server.use('/users', users)

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
