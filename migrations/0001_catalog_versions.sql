CREATE TABLE catalog_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  payload_json TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE INDEX idx_catalog_versions_tool_status
  ON catalog_versions (tool, status, published_at);
