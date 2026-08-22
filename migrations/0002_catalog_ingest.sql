CREATE TABLE catalog_ingest (
  tool TEXT PRIMARY KEY,
  staged_hash TEXT NOT NULL,
  ingested_at TEXT NOT NULL
);
