#!/usr/bin/env node
/**
 * 把本機 D1 最新一筆 published catalog（及 ingest hash）用參數綁定寫入遠端。
 * 不用 wrangler --file，以免 JSON 寫進 SQL 字面值後觸發 SQLITE_TOOBIG。
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const ROOT = process.cwd();
const CONFIG_PATH = join(ROOT, "wrangler.jsonc");
const LOCAL_D1_DIR = join(ROOT, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJsoncField(source, key) {
  const match = source.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
  return match?.[1] ?? null;
}

function openReadonly(path) {
  return new DatabaseSync(path, { readOnly: true });
}

function findLocalCatalog() {
  if (!existsSync(LOCAL_D1_DIR)) {
    fail("找不到本機 D1（.wrangler/state/…）。請先 npm run dev 或本機寫入目錄。");
  }

  /** @type {null | { path: string, version: Record<string, string>, ingest: Record<string, string> | null }} */
  let best = null;

  for (const name of readdirSync(LOCAL_D1_DIR)) {
    if (!name.endsWith(".sqlite") || name === "metadata.sqlite") continue;
    const path = join(LOCAL_D1_DIR, name);
    let db;
    try {
      db = openReadonly(path);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      if (!tables.some((row) => row.name === "catalog_versions")) continue;

      const version = db
        .prepare(
          `SELECT tool, version, status, payload_json, source_hash, published_at
           FROM catalog_versions
           WHERE status = 'published'
           ORDER BY datetime(published_at) DESC, id DESC
           LIMIT 1`,
        )
        .get();
      if (!version) continue;

      let ingest = null;
      if (tables.some((row) => row.name === "catalog_ingest")) {
        ingest = db.prepare("SELECT tool, staged_hash, ingested_at FROM catalog_ingest WHERE tool = ?").get(version.tool);
      }

      if (!best || String(version.published_at) > String(best.version.published_at)) {
        best = { path, version, ingest };
      }
    } catch {
      // 不是目前使用中的 D1 檔就略過
    } finally {
      db?.close();
    }
  }

  return best;
}

function wranglerConfigPaths() {
  const home = homedir();
  return [
    process.env.WRANGLER_HOME && join(process.env.WRANGLER_HOME, "config/default.toml"),
    join(home, "Library/Preferences/.wrangler/config/default.toml"),
    join(home, ".config/.wrangler/config/default.toml"),
    join(home, ".wrangler/config/default.toml"),
  ].filter(Boolean);
}

function readWranglerOAuthToken() {
  for (const path of wranglerConfigPaths()) {
    if (!existsSync(path)) continue;
    const match = readFileSync(path, "utf8").match(/^\s*oauth_token\s*=\s*"([^"]+)"/m);
    if (match) return match[1];
  }
  return null;
}

function parseAccountId(whoami) {
  const ids = [...whoami.matchAll(/\b([a-f0-9]{32})\b/gi)].map((match) => match[1]);
  return ids[0] ?? null;
}

function wrangler(args) {
  return execFileSync("npx", ["wrangler", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function d1Query(accountId, databaseId, token, body) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    const detail = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(detail);
  }
  return payload;
}

function problemCount(payloadJson) {
  try {
    const catalog = JSON.parse(payloadJson);
    return Array.isArray(catalog.problems) ? catalog.problems.length : "?";
  } catch {
    return "?";
  }
}

if (!existsSync(CONFIG_PATH)) {
  fail("請在專案根目錄執行 npm run db:push");
}

const wranglerConfig = readFileSync(CONFIG_PATH, "utf8");
const databaseName = readJsoncField(wranglerConfig, "database_name");
const databaseId = readJsoncField(wranglerConfig, "database_id");
if (!databaseName || !databaseId) {
  fail("wrangler.jsonc 缺少 database_name 或 database_id");
}

console.log("讀取本機最新 published catalog…");
const local = findLocalCatalog();
if (!local) {
  fail("本機 catalog_versions 沒有 published 資料，已中止，以免清空遠端。");
}

JSON.parse(local.version.payload_json);
const payloadChars = local.version.payload_json.length;
console.log(
  `本機最新版本 ${local.version.version}，${problemCount(local.version.payload_json)} 題，payload ${payloadChars} 字元`,
);

console.log("確認 Cloudflare 登入…");
let whoami = "";
try {
  whoami = wrangler(["whoami"]);
} catch (error) {
  fail("wrangler whoami 失敗。請先執行 npx wrangler login。");
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || parseAccountId(whoami);
const token = process.env.CLOUDFLARE_API_TOKEN || readWranglerOAuthToken();
if (!accountId || !token) {
  fail("讀不到 Cloudflare 帳號或憑證。請執行 npx wrangler login，或設定 CLOUDFLARE_API_TOKEN 與 CLOUDFLARE_ACCOUNT_ID。");
}

const { version, ingest } = local;
const batch = [
  {
    sql: `INSERT INTO catalog_versions (tool, version, status, payload_json, source_hash, published_at)
          VALUES (?, ?, 'published', ?, ?, ?)`,
    params: [version.tool, version.version, version.payload_json, version.source_hash, version.published_at],
  },
  {
    sql: `DELETE FROM catalog_versions
          WHERE tool = ?
            AND id NOT IN (
              SELECT id FROM (
                SELECT id FROM catalog_versions
                WHERE tool = ?
                ORDER BY datetime(published_at) DESC, id DESC
                LIMIT 1
              )
            )`,
    params: [version.tool, version.tool],
  },
];

if (ingest) {
  batch.push({
    sql: `INSERT INTO catalog_ingest (tool, staged_hash, ingested_at)
          VALUES (?, ?, ?)
          ON CONFLICT(tool) DO UPDATE SET
            staged_hash = excluded.staged_hash,
            ingested_at = excluded.ingested_at`,
    params: [ingest.tool, ingest.staged_hash, ingest.ingested_at],
  });
} else {
  batch.push({
    sql: "DELETE FROM catalog_ingest WHERE tool = ?",
    params: [version.tool],
  });
}

console.log(`以參數綁定寫入遠端 ${databaseName}（只同步最新一筆，不搬歷史版本）…`);
try {
  await d1Query(accountId, databaseId, token, { batch });
} catch (error) {
  fail(`遠端寫入失敗：${error instanceof Error ? error.message : error}`);
}

const verify = await d1Query(accountId, databaseId, token, {
  sql: `SELECT
          (SELECT COUNT(*) FROM catalog_versions) AS versions,
          (SELECT version FROM catalog_versions ORDER BY datetime(published_at) DESC, id DESC LIMIT 1) AS version,
          (SELECT length(payload_json) FROM catalog_versions ORDER BY datetime(published_at) DESC, id DESC LIMIT 1) AS payload_bytes,
          (SELECT COUNT(*) FROM catalog_ingest) AS ingest_rows`,
});
const row = verify.result?.[0]?.results?.[0];
console.log(
  `遠端目前：catalog_versions ${row?.versions ?? "?"} 列（${row?.version ?? "?"}，payload ${row?.payload_bytes ?? "?"} 字元），catalog_ingest ${row?.ingest_rows ?? "?"} 列`,
);
console.log("完成。");
