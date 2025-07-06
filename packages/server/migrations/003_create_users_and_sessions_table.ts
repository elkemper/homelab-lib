import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.string('email');
  });

  await knex.schema.createTable('sessions', function (table) {
    table.increments('id').primary();
    table.integer('userId').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('expiresAt').nullable();
  });

  await knex('migrations').insert({ name: '003_create_users_and_sessions_tables' });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sessions');
  await knex.schema.dropTable('users');

  await knex('migrations').where({ name: '003_create_users_and_sessions_tables' }).del();
}
