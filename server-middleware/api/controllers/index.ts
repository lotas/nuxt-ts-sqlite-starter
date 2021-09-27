import * as middlewares from '../middlewares'
import HealthController from './health'

const controllers = [
  new HealthController(middlewares)
]

export default controllers
