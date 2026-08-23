# 營養師工作台

Vue 3 + Cloudflare Workers + D1。本機與正式部署走同一套 `wrangler.jsonc`。

需要 Node 22+（與目前 Wrangler 一致）。

## 開發

```bash
npm install
npm run dev
```

`npm run dev` 會先套用本機 D1 migration，再啟動 Vite（Workers runtime）。

- `/` 工具一覽
- `/tools/pes` PES 診斷文本產生器
- `/internal/pes-preview` 檢查目前 staged 裡待入庫的抽取結果

產生器讀 `/api/pes/catalog`：D1 有已發布版本就用 D1，否則回落到 `data/staged/pes-catalog.json`。

## 資料流

1. 原始材料放 `data/sources/`
2. 目前抽取的 P 寫入 `data/staged/pes-catalog.json`（只放這一筆／同一頁的幾筆）
3. 在 `/internal/pes-preview` 確認
4. 寫入 D1 `catalog_versions`（與既有目錄合併），成功後清空 staged

P 的 id／名稱／頁碼索引在 `data/pes-index.json`。

## PES 資料來源

索引依 eNCPT / NCPT 2023 公開術語整理，完整 E／S 清單以訂閱 [eNCPT](https://www.ncpro.org/) 為準。原始 PDF 在 `data/sources/`。

## 部署

第一次上正式環境前，先建立 D1 並把 id 填進 `wrangler.jsonc`。完整步驟見 [docs/deploy.md](docs/deploy.md)。

```bash
npx wrangler d1 create nutrition-helper
npm run deploy
```

本機已發布的 D1 目錄要同步到線上：

```bash
npm run db:push
```
