import { NextFunction, Request, Response } from 'express'
import HttpError from '../utils/HttpError'
import logger from '../utils/logger'

export const isOwner = (prop: string, ownerKey = 'userId') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user && !(req as any)[prop]) {
      logger.warn('Trying to access entity which does not exist', {
        url: req.url,
        user: user && user.userId,
        prop
      })
      return next(new HttpError('Missing entity', 400))
    }

    if ((req as any)[prop][ownerKey] !== user.userId) {
      logger.warn('Trying to access entity which does not belong', {
        url: req.url,
        prop,
        user: user && user.userId,
        params: req.params
      })
      return next(new HttpError('Access denied', 403))
    }

    next()
  }
