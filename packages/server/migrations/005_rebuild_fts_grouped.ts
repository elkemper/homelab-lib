import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop old fan-out FTS (1 row per author, detail=none -> no column search, no bm25 weights).
  await knex.schema.raw(`DROP TABLE IF EXISTS books_fts;`);
  await knex.schema.raw(`CREATE VIRTUAL TABLE books_fts USING FTS5(
    BookID UNINDEXED,
    Title,
    Author,
    SeriesTitle,
    prefix="2 3 4",
    tokenize="unicode61 remove_diacritics 2"
  );`);
  console.log(`FTS Table recreated (grouped, prefix 2 3 4).\nImporting data.\nPlease be patient, it could take a while.`);
  console.time('Import');
  // One row per book: authors aggregated with group_concat.
  await knex.schema.raw(`INSERT INTO books_fts (BookID, Title, Author, SeriesTitle)
    SELECT b.BookID, b.Title,
      (SELECT group_concat(a.SearchName, ' ')
        FROM Author_List al JOIN Authors a ON a.AuthorID = al.AuthorID
        WHERE al.BookID = b.BookID),
      s.SeriesTitle
    FROM Books b LEFT JOIN Series s ON s.SeriesID = b.SeriesID;`);
  console.timeEnd('Import');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`DROP TABLE IF EXISTS books_fts;`);
  await knex.schema.raw(`CREATE VIRTUAL TABLE books_fts USING FTS5(
    BookID, detail=none,
    Title,
    Author,
    SeriesTitle,
    );`);
  await knex.schema.raw(`INSERT INTO books_fts
    SELECT Books.BookID, Books.Title, Authors.SearchName, Series.SeriesTitle FROM Books
    LEFT JOIN Author_List  ON Author_List.BookID=Books.BookID
    LEFT JOIN Authors  ON Authors.AuthorID=Author_List.AuthorID
    LEFT JOIN Series  ON Series.SeriesID = Books.SeriesID;`);
}
