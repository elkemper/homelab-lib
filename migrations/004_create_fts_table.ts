import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`CREATE VIRTUAL TABLE books_fts USING FTS5(
    BookID, detail=none,
    Title,
    Author,
    SeriesTitle,
    );`);
  console.log(`FTS Table created.\nImporting data.\nPlease be patient, it could take a while.`);
  console.time('Import');
  await knex.schema.raw(`INSERT INTO books_fts 
    SELECT Books.BookID, Books.Title, Authors.SearchName, Series.SeriesTitle FROM Books 
    LEFT JOIN Author_List  ON Author_List.BookID=Books.BookID
    LEFT JOIN Authors  ON Authors.AuthorID=Author_List.AuthorID
    LEFT JOIN Series  ON Series.SeriesID = Books.SeriesID;`);
  console.timeEnd('Import');
  //deleting migrations table, because it's redundant - knex has it's own table.
  await knex.schema.dropTable('migrations');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('books_fts');

  await knex.schema.createTable('migrations', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('applied_at').defaultTo(knex.fn.now());
  });

  await knex('migrations').insert({ name: '002_create_migration_table' });
  await knex('migrations').insert({ name: '003_create_users_and_sessions_tables' });

}
