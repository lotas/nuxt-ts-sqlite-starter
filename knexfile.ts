// Update with your config settings.

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './data/db.sqlite3',
  },
  useNullAsDefault: true,
  migrations: {
    tableName: 'knex_migrations',
    directory: './data/migrations',
    loadExtensions: ['.ts', '.js'],
    extension: 'ts'
  },
  seeds: {
    directory: './data/seeds'
  }
};
