import path from 'path'
import knex, { Knex } from 'knex'

const DB_FILE = path.join(__dirname, '../../../data/db.sqlite3')

export default class DbService {
  private db: Knex
  private users: () => Knex.QueryBuilder

  private maxRows = 100

  public constructor() {
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: DB_FILE,
      },
      useNullAsDefault: true,
    })
    this.users = () => this.db('users')
  }

  public async listOfUsers() {
    const qb = this.users()
    const data = await qb.select()

    return {
      data,
      pagination: {
        total: data.length,
      },
    }
  }

  public async getUserById(id: string) {
    const qb = this.users().where('id', id).limit(1)

    const user = await qb.select()
    return Array.isArray(user) && user.length === 1
      ? user[0]
      : null
  }
}
