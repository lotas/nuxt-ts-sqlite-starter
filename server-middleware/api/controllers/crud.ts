import { NextFunction, Request, Response } from 'express'
import { MiddlewaresCollection } from '../middlewares'
import { BaseController } from './base'

export class CrudController extends BaseController  {
  get modelName() {
    return ''
  }

  get paramName() {
    return `${this.modelName}Id`
  }

  get requiresAuth() {
    return true
  }

  customRoutes(_middlewares: MiddlewaresCollection) {
    // init custom extra routes
  }

  model() {
    return this.db.getQueryBuilder(this.modelName)
  }

  /**
   * Transform entity if necessary before insert/update
   *
   * @param entity
   * @returns
   */
  preCreate(entity: any) {
    this.logger.debug('Pre create', entity)
    return entity
  }

  postCreate(entity: any) {
    this.logger.debug('Post create', entity)
  }

  postUpdate(entity: any) {
    this.logger.debug('Post update', entity)
  }

  postDelete(entity: any) {
    this.logger.debug('Post delete', entity)
  }

  initRoutes(middlewares: MiddlewaresCollection) {
    const { isAuthenticated, isOwner } = middlewares

    const modelName = this.modelName
    if (!modelName) {
      throw new Error('modelName not defined')
    }

    let path = modelName
    path += path.endsWith('y') ? 'ies' : 's'

    const paramName = this.paramName
    this.handleParam(paramName, modelName)


    const baseMiddlewares = this.requiresAuth ? [isAuthenticated] : []
    const modifyMiddlewares = this.requiresAuth ? [...baseMiddlewares, isOwner(paramName)] : []

    // Init custom routes first, as they should be registered before rest
    this.customRoutes(middlewares)

    this.handleUrl('get', `/${path}`, baseMiddlewares, this.listItems)
    this.handleUrl('post', `/${path}`, baseMiddlewares, this.createItem)
    this.handleUrl('get', `/${path}/:${paramName}`, modifyMiddlewares, this.getItem)
    this.handleUrl('put', `/${path}/:${paramName}`, modifyMiddlewares, this.updateItem)
    this.handleUrl('delete', `/${path}/:${paramName}`, modifyMiddlewares, this.deleteItem)
  }

  async listItems(req: Request, res: Response, _next: NextFunction) {
    let limit = 50
    let offset = 0

    const qb = await this.getQueryBuilder(this.modelName)

    const [count] = qb.clone().count('*').select()

    if (req.query.limit) {
      limit = parseInt(String(req.query.limit), 10)
      if (!isNaN(limit)) {
        qb.limit(limit)
      }
    }
    if (req.query.offset) {
      offset = parseInt(String(req.query.offset), 10)
      if (!isNaN(offset)) {
        qb.offset(offset)
      }
    }

    res.json({
      data: qb.select(),
      pagination: {
        total: count,
        limit,
        offset
      }
    })
  }

  private async saveOne(data: any) {
    this.logger.info('Saving item', data)
    data = await this.preCreate(data)
    return this.model().insert(data)
  }

  async createItem(req: Request, res: Response) {
    const data = req.body
    let out

    if (!Array.isArray(data)) {
      out = await this.saveOne(data)
    } else {
      out = await Promise.all(data.map(one => this.saveOne(one)))
    }

    res.status(201).json(out)
    this.postCreate(out)
  }

  async getItem(req: Request, res: Response) {
    const { params } = req
    const entity = await this.db.one(this.modelName, params[this.paramName], this.paramName)

    if (!entity) {
      return res.status(404)
    }

    res.json(entity)
  }

  async updateItem(req: Request, res: Response) {
    const { params} = req
    const data = req.body

    this.logger.info('Updating item', { params, data })
    const entity = await this.model()
      .where(this.paramName, params[this.paramName])
      .update(data, '*')

    if (!entity) {
      return res.status(404)
    }
    res.json(entity)

    this.postUpdate(entity)
  }

  async deleteItem(req: Request, res: Response) {
    const { params } = req
    this.logger.info('Removing item', { params })

    await this.model()
      .where(this.paramName, params[this.paramName])
      .del()

    res.status(204).json({ success: true })
    this.postDelete(params)
  }
}
