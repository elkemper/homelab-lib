-- E2E seed: minimal Librusec library tables (simplified DDL — plain types,
-- no MHL_* collation/triggers which vanilla SQLite cannot create).
-- Only columns the app reads. books_fts is populated by migrations
-- 004/005 at server start, so this file must run BEFORE the server boots.
-- Single artifact: sqlite3 <db> < seed.sql

CREATE TABLE Series (
  SeriesID    INTEGER NOT NULL PRIMARY KEY,
  SeriesTitle VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE Authors (
  AuthorID   INTEGER NOT NULL PRIMARY KEY,
  LastName   VARCHAR(128) NOT NULL,
  FirstName  VARCHAR(128),
  MiddleName VARCHAR(128),
  SearchName VARCHAR(512)
);

CREATE TABLE Author_List (
  AuthorID INTEGER NOT NULL,
  BookID   INTEGER NOT NULL,
  PRIMARY KEY (BookID, AuthorID)
);

CREATE TABLE Books (
  BookID    INTEGER NOT NULL PRIMARY KEY,
  Title     VARCHAR(150) NOT NULL,
  SeriesID  INTEGER,
  SeqNumber INTEGER,
  Lang      VARCHAR(2),
  Folder    VARCHAR(200),
  FileName  VARCHAR(170) NOT NULL,
  Ext       VARCHAR(10),
  IsLocal   INTEGER NOT NULL DEFAULT 0,
  IsDeleted INTEGER NOT NULL DEFAULT 0
);

-- Curated core
INSERT INTO Series (SeriesID, SeriesTitle) VALUES (1, 'E2E Saga');

INSERT INTO Authors (AuthorID, LastName, FirstName, MiddleName, SearchName) VALUES
  (1, 'Chronicle', 'John', '', 'CHRONICLE JOHN'),
  (2, 'Doe', 'Jane', '', 'DOE JANE'),
  (3, 'Sunstone', 'Peter', '', 'SUNSTONE PETER'),
  (10, 'Prober', 'Pagi', '', 'PROBER PAGI');

INSERT INTO Books (BookID, Title, SeriesID, SeqNumber, Lang, Folder, FileName, Ext, IsDeleted) VALUES
  (1, 'The E2E Test Chronicles', 1, 1, 'en', 'e2e.zip', 'e2ebook', '.fb2', 0),
  (2, 'Sunstone Atlas', NULL, NULL, 'en', 'e2e.zip', 'sunstone', '.fb2', 0),
  (3, 'Ordinary Field Notes', NULL, NULL, 'en', 'e2e.zip', 'fieldnotes', '.fb2', 0),
  (4, 'Deleted Unique Zzzqx', NULL, NULL, 'en', 'e2e.zip', 'deleted', '.fb2', 1);

INSERT INTO Author_List (BookID, AuthorID) VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (3, 3),
  (4, 1);

-- Bulk block: 53 books sharing one token, to exercise pagination (page size 50).
WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 53)
INSERT INTO Books (Title, Lang, Folder, FileName, Ext, IsDeleted)
SELECT 'Pagination Probe ' || x, 'en', 'e2e.zip', 'probe' || x, '.fb2', 0 FROM n;

INSERT INTO Author_List (BookID, AuthorID)
SELECT BookID, 10 FROM Books WHERE Title LIKE 'Pagination Probe%';
