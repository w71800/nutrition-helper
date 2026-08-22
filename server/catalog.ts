import { emptyStagedCatalog } from "@shared/catalog";
import type { CatalogVersionMeta, PesCatalog } from "@shared/pes";

const TOOL = "pes";

type CatalogRow = {
  id: number;
  version: string;
  payload_json: string;
  source_hash: string;
  published_at: string | null;
};

export type PublishedCatalog = {
  meta: CatalogVersionMeta;
  catalog: PesCatalog;
};

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function toMeta(row: CatalogRow): CatalogVersionMeta {
  return {
    id: row.id,
    version: row.version,
    sourceHash: row.source_hash,
    publishedAt: row.published_at,
  };
}

export async function getPublishedCatalog(db: D1Database): Promise<PublishedCatalog | null> {
  try {
    const row = await db
      .prepare(
        `SELECT id, version, payload_json, source_hash, published_at
         FROM catalog_versions
         WHERE tool = ? AND status = 'published'
         ORDER BY datetime(published_at) DESC, id DESC
         LIMIT 1`,
      )
      .bind(TOOL)
      .first<CatalogRow>();

    if (!row) return null;

    return {
      meta: toMeta(row),
      catalog: JSON.parse(row.payload_json) as PesCatalog,
    };
  } catch {
    return null;
  }
}

export async function hashCatalog(catalog: PesCatalog): Promise<string> {
  return sha256(JSON.stringify(catalog));
}

export async function resolveStagedCatalog(db: D1Database, staged: PesCatalog): Promise<PesCatalog> {
  if (staged.problems.length === 0) return staged;

  const ingested = await getStagedIngestHash(db);
  if (!ingested) return staged;

  const hash = await hashCatalog(staged);
  return ingested === hash ? emptyStagedCatalog(staged) : staged;
}

async function getStagedIngestHash(db: D1Database): Promise<string | null> {
  try {
    const row = await db
      .prepare(`SELECT staged_hash FROM catalog_ingest WHERE tool = ?`)
      .bind(TOOL)
      .first<{ staged_hash: string }>();
    return row?.staged_hash ?? null;
  } catch {
    return null;
  }
}

export async function recordStagedIngest(db: D1Database, staged: PesCatalog): Promise<void> {
  const stagedHash = await hashCatalog(staged);
  await db
    .prepare(
      `INSERT INTO catalog_ingest (tool, staged_hash, ingested_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(tool) DO UPDATE SET
         staged_hash = excluded.staged_hash,
         ingested_at = excluded.ingested_at`,
    )
    .bind(TOOL, stagedHash)
    .run();
}

export async function publishCatalog(db: D1Database, catalog: PesCatalog): Promise<CatalogVersionMeta> {
  const payload = JSON.stringify(catalog);
  const sourceHash = await sha256(payload);
  const version = new Date().toISOString();

  const result = await db
    .prepare(
      `INSERT INTO catalog_versions (tool, version, status, payload_json, source_hash, published_at)
       VALUES (?, ?, 'published', ?, ?, datetime('now'))
       RETURNING id, version, payload_json, source_hash, published_at`,
    )
    .bind(TOOL, version, payload, sourceHash)
    .first<CatalogRow>();

  if (!result) {
    throw new Error("寫入 D1 後無法讀回版本資訊");
  }

  return toMeta(result);
}
