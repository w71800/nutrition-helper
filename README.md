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
- `/internal/pes-preview` 檢查目前抽取的那一筆 P（例如 `?id=underweight`）

產生器讀 `/api/pes/catalog`：D1 有已發布版本就用 D1，否則回落到 `data/staged/pes-catalog.json`。

## 資料流

1. 原始材料放 `data/sources/`
2. 轉成 `data/staged/pes-catalog.json`（進 git）
3. 在 `/internal/pes-preview` 確認
4. 寫入 D1 `catalog_versions`

## PES 資料來源

staged 主檔依 eNCPT / NCPT 2023 公開術語整理，完整 E／S 清單以訂閱 [eNCPT](https://www.ncpro.org/) 為準。原始 PDF 在 `data/sources/`。

## 部署

第一次上正式環境前，先建立 D1 並把 id 填進 `wrangler.jsonc`：

```bash
npx wrangler d1 create nutrition-helper
npm run deploy
```
