# 部署指南

Vue 3 前端 + Cloudflare Workers + D1。本機與正式環境共用 `wrangler.jsonc`。

需要 Node 22+、Cloudflare 帳號。不必付費方案即可部署。

## 第一次

```bash
npm install
npx wrangler login
npx wrangler d1 create nutrition-helper
```

把印出的 `database_id` 填進 `wrangler.jsonc` 既有的 `DB` binding，不要新增第二筆。`binding` 必須是 `DB`，並保留 `migrations_dir`。

第一次部署會問 `workers.dev` 子網域。這是**帳號前綴**，網址會是：

```
https://nutrition-helper.<你取的前綴>.workers.dev
```

不要取成 `nutrition-helper`，否則會疊成 `nutrition-helper.nutrition-helper.workers.dev`。之後可在 Dashboard → Workers & Pages → Your subdomain 更改。

```bash
npm run deploy
```

這會建置前端、套用遠端 migration、上傳 Worker。D1 **列資料不會**跟著過去。

## 之後再部署

`wrangler.jsonc` 的 `database_id` 固定用遠端那個，不必為了本機／遠端來回改。

```bash
npm run deploy
```

只改 schema 時：

```bash
npm run db:migrate:remote
```

## 本機與遠端 D1

同一份 `database_id`，兩套庫：

| 怎麼跑 | 打到哪 |
|---|---|
| `npm run dev`、`--local` | 本機 `.wrangler/state/` |
| 正式網址、`--remote`、`npm run deploy` | Cloudflare D1 |

程式只讀 `c.env.DB`，由 runtime 注入對應的庫。

本機在 `/internal/pes-preview` 寫入 D1，只會進本機。要把本機目錄推到線上：

```bash
npm run db:push
```

這會**覆寫**遠端的 `catalog_versions`、`catalog_ingest`，使遠端與本機相同。本機若沒有 `catalog_versions` 資料會中止，以免清空遠端。

建議正式寫入也可直接在線上 `/internal/pes-preview` 做；`db:push` 適合本機已確認、要一次對齊遠端的時候。

## 常用指令

```bash
npm run dev                 # 本機開發（先套本機 migration）
npm run deploy              # 建置並部署
npm run db:migrate:local    # 只套本機 schema
npm run db:migrate:remote   # 只套遠端 schema
npm run db:push             # 本機 D1 → 遠端 D1
```

## 用量與保護

`*.workers.dev` 預設公開。`/api/*` 每次都算 Worker 請求（Free 每天約 10 萬次）；靜態頁不占此額度。超標會擋請求，不會自動扣款。

`POST /api/internal/pes/publish` 目前沒有驗證。個人工作台可用 [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/) 擋在網站前面，並用指定 email 放行。通過後工作階段預設約 24 小時，不必每次重登。
