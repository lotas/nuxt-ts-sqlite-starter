import { NextFunction, Request, Response } from 'express'
import DbService from '../services/DbService'
import HttpError from '../utils/HttpError'
import logger from '../utils/logger'

const db = new DbService()

export const isAuthenticated = async (req: Request, _res: Response, next: NextFunction) => {
  const authToken = String(req.header('Authorization')).replace(/^Bearer\s*/, '')

  if (authToken) {
    const token = await db.one('accessToken', authToken, 'token')

    if (!token) {
      return next(new HttpError('Invalid token', 401))
    }

    if (token.createdAt.getTime() + token.ttl * 1000 < Date.now()) {
      logger.info('Token expired', { token: token.toJSON() })
      return next(new HttpError('Token expired', 401))
    }

    logger.info('Token valid', { userId: token.userId })

    ;(req as any).user = await db.one('user', token.userId)

    return next()
  }

  return next(new HttpError('Please login', 401))
}
