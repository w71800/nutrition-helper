#!/usr/bin/env bash
set -euo pipefail

DB_NAME="nutrition-helper"
TABLES=(catalog_versions catalog_ingest)

if [[ ! -f wrangler.jsonc ]]; then
  echo "請在專案根目錄執行 npm run db:push" >&2
  exit 1
fi

tmp="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

echo "匯出本機 D1…"
for table in "${TABLES[@]}"; do
  CI=1 npx wrangler d1 export "$DB_NAME" --local --table="$table" --no-schema --output="$tmp/$table.sql"
done

if ! grep -q 'INSERT' "$tmp/catalog_versions.sql"; then
  echo "本機 catalog_versions 沒有資料，已中止，以免清空遠端。" >&2
  exit 1
fi

echo "遠端將改成與本機相同（覆寫 catalog_versions、catalog_ingest）。"
CI=1 npx wrangler d1 execute "$DB_NAME" --remote --yes --command \
  "DELETE FROM catalog_ingest; DELETE FROM catalog_versions;"

echo "匯入遠端 D1…"
for table in "${TABLES[@]}"; do
  CI=1 npx wrangler d1 execute "$DB_NAME" --remote --yes --file="$tmp/$table.sql"
done

echo "遠端目前列數："
CI=1 npx wrangler d1 execute "$DB_NAME" --remote --command \
  "SELECT 'catalog_versions' AS name, COUNT(*) AS cnt FROM catalog_versions UNION ALL SELECT 'catalog_ingest', COUNT(*) FROM catalog_ingest;"
