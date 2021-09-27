import { Knex } from "knex";

export function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user', (table) => {
    table.increments('userId')
    table.string('email')
    table.datetime('createdAt')
    table.datetime('updatedAt')
  })
  .createTable('accessToken', (table) => {
    table.increments('accessTokenId')
    table.integer('ttl')
    table.integer('userId')
    table.datetime('createdAt')
    table.foreign('userId').references('userId').inTable('user')
  })
}


export function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('user')
    .dropTable('accessToken')
}

