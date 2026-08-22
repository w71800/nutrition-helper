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
