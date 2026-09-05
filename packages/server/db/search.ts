import Database from 'better-sqlite3';
import config from '../config';
import { SearchResult } from '../models/booksAndSearch';

let connection: Database.Database | null = null;

function getConnection(): Database.Database {
  if (!connection) {
    connection = new Database(config.dbPath, {
      fileMustExist: true,
      readonly: true,
    });
  }
  return connection;
}

const MAX_QUERY_LEN = 200;
const MIN_PREFIX_LEN = 2;

// Weights for bm25: Title > Author > SeriesTitle (BookID is UNINDEXED).
const BM25_WEIGHTS = `bm25(books_fts, 0, 3.0, 2.0, 0.5)`;

/**
 * Turns raw user input into a safe FTS5 MATCH string.
 * Each word is quoted (no syntax crashes) and gets a  prefix '*'.
 */
export function buildMatchQuery(raw: string): string | null {
  if (!raw) return null;
  const tokens = raw
    .trim()
    .slice(0, MAX_QUERY_LEN)
    .split(/\s+/)
    .map((t) => t.replace(/["*]/g, ''))
    .filter((t) => t.length > 0)
    .map((t) => (t.length >= MIN_PREFIX_LEN ? `"${t}"*` : `"${t}"`));
  if (tokens.length === 0) return null;
  return tokens.join(' AND ');
}

export interface SearchPage {
  rows: SearchResult[];
  total: number;
}

//TODO: fix similar aliases, think about testing the query
/**
 * Single round trip: ranked page + exact total.
 * One row per book, all authors grouped, deleted books excluded.
 */
export async function search(matchQuery: string, limit: number, offset: number): Promise<SearchPage> {
  const stmt = getConnection().prepare<[string, number, number], SearchResult & { total: number }>(`
    SELECT b.BookID, b.Title, b.Lang, b.SeqNumber, s.SeriesTitle, f.total,
      (SELECT group_concat(
          a.LastName || ' ' || a.FirstName || ifnull(' ' || CASE WHEN length(a.MiddleName) > 0 THEN a.MiddleName END, ''),
          ', '
        )
        FROM Author_List al JOIN Authors a ON a.AuthorID = al.AuthorID
        WHERE al.BookID = b.BookID) AS authors
    FROM (
      SELECT BookID, COUNT(*) OVER() AS total
      FROM (
        SELECT books_fts.BookID
        FROM books_fts JOIN Books b ON b.BookID = books_fts.BookID
        WHERE books_fts MATCH ? AND b.IsDeleted = 0
        ORDER BY ${BM25_WEIGHTS} LIMIT -1
      )
      LIMIT ? OFFSET ?
    ) f
    JOIN Books b ON b.BookID = f.BookID
    LEFT JOIN Series s ON s.SeriesID = b.SeriesID
  `);

  const found = stmt.all(matchQuery, limit, offset);
  // Empty page (offset past end) carries no total, count it directly.
  if (found.length === 0) {
    const cnt = getConnection()
      .prepare(
        `SELECT COUNT(DISTINCT books_fts.BookID) AS total
         FROM books_fts JOIN Books b ON b.BookID = books_fts.BookID
         WHERE books_fts MATCH ? AND b.IsDeleted = 0`
      )
      .get(matchQuery) as { total: number };
    return { rows: [], total: cnt.total };
  }
  const total = found[0].total;
  const rows = found.map(({ total: _ignored, ...rest }) => rest);
  return { rows, total };
}
