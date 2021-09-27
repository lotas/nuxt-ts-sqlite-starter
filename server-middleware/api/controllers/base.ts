import { NextFunction, Request, Response, Router } from 'express'
import { Knex } from 'knex'
import winston from 'winston'
import { MiddlewaresCollection } from '../middlewares'
import DbService from '../services/DbService'
import HttpError from '../utils/HttpError'
import logger from '../utils/logger'

type HttpMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'

export class BaseController {
  public router: Router
  protected logger: winston.Logger
  protected db: DbService

  constructor(_middlewares: MiddlewaresCollection) {
    this.router = Router()
    this.logger = logger

    this.db = new DbService()
    this.initRoutes(_middlewares)
  }

  initRoutes(_middlewares: MiddlewaresCollection) {
    // overwrite when needed
  }

  handleUrl(method: HttpMethod, url: string, ...handlers: any[]) {
    const handler = handlers.pop()
    if (!handler) {
      throw new Error('No handler defined')
    }

    this.router[method](url, handlers, async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler.bind(this)(req, res, next)
      } catch (err) {
        logger.warn(err)
        next(err)
      }
    })
  }

  getQueryBuilder(table: string): Knex.QueryBuilder {
    return this.db.getQueryBuilder(table)
  }

  createError(code: number, message: string) {
    return new HttpError(message, code)
  }

  /**
   * Add a 'param' handler to express router
   *
   * Fetches entity by PK 'id' and assigns to `req[asName]`
   *
   * @param idParam
   * @param entityName
   * @param asName
   */
  handleParam(idParam: string, entityName: string, asName?: string) {
    const model = this.getQueryBuilder(entityName)

    this.router.param(idParam, async (req, _, next, id) => {
      const [entity] = await model.where('id', id).limit(1).select()

      if (entity) {
        (req as any)[asName || entityName.toLowerCase()] = entity[0]
        return next()
      }
      this.logger.warn('Entity not found', { entityName, idParam, id, asName })
      next(this.createError(404, `${entityName} not found`))
    })
  }

}
