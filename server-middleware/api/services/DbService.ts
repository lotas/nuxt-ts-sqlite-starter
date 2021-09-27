import path from 'path'
import knex, { Knex } from 'knex'

const DB_FILE = path.join(__dirname, '../../../data/db.sqlite3')

export default class DbService {
  private db: Knex

  public constructor() {
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: DB_FILE,
      },
      useNullAsDefault: true,
      migrations: {
        tableName: '_migrations'
      }
    })
  }

  public getQueryBuilder(table: string): Knex.QueryBuilder {
    return this.db(table)
  }

  public async one(table: string, id: string, idKey = 'id') {
    const qb = this.db(table).where(idKey, id).limit(1)

    const row = await qb.select()
    return Array.isArray(row) && row.length === 1
      ? row[0]
      : null
  }
}
