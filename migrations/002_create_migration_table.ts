import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('migrations', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('applied_at').defaultTo(knex.fn.now());
  });

  await knex('migrations').insert({ name: '002_create_migration_table' });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('migrations');
}
