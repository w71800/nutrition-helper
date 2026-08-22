---
name: extract-pes-problem
description: 從營養診斷手冊照片或文字抽取一筆 PES 問題（P）及病因（E）、五類徵候（S），寫入 data/staged/pes-catalog.json。在使用者提供 P 頁、S 表、營養診斷照片，或要求抽取／填入 PES 問題時使用。
---

# 抽取一筆 PES 問題

把**目前這次抽取**寫入 `data/staged/pes-catalog.json`。staged 的 `problems` 只放這一筆 P（或同一紙本頁上的兩筆）。不要留下目錄裡其他問題。

身分從 `data/pes-index.json` 用中文 `label`、英文 `labelEn` 或 `page` 對上。沿用該筆的 `id`、`label`、`labelEn`、`page`、`domain`，除非索引明顯錯了。

## 不確定就問

你不確定的話，就問使用者，不用特地去查。照片裁切、字跡不清、●／◆ 分不清、用語對不上時，先問再寫；不要上網或從其他文獻補字。

## 流程

1. 讀 `shared/pes.ts` 與 `data/pes-index.json`。
2. 依照片／文字逐字謄錄。不要發明缺漏的 E 或 S。
3. 保留 staged 的 `meta` 與 `domains`。只把 `problems` 換成填好的紀錄。
4. 若兩筆 P 共用同一紙本頁（明顯／嚴重體重減輕；第 11 頁肥胖群），仍寫成**分開的紀錄**。先複製共用的 E／S，再只改相異處。
5. 若有改到 TS，做 typecheck。請使用者打開 `/internal/pes-preview`。

## 欄位規則

- `definition`：保留紙本換行（`\n`）。年齡／BMI 條目放定義，不要當 E。
- 病因開頭套話（病理、生理、心理…）**不是**病因。略過。
- `etiologies[].label`：只寫原因那句。
- 括號裡的 `如：…` → `examples: string[]`。不要留在 `label` 裡。
- `signs` 必須正好這五個 id，且順序如下：

  1. `biochemical` 生化檢驗資料、醫療檢驗及步驟
  2. `anthropometric` 體位測量
  3. `nfpe` 營養相關理學檢查發現
  4. `food_nutrition_history` 飲食／營養紀錄
  5. `client_history` 個案史

- 該類為「無」→ `{ "id": "…", "items": [] }`。不要省略該類。
- ● 圓點項 → 可選的 `PesSign`（`id` + `label`）。
- ◆ 菱形／巢狀項 → 歸入該徵候的 `details[]`，不是子選項。
- 註腳放在對應徵候的 `details`。
- `id`：kebab-case 英文 slug；同一問題的病因之間、同一徵候類別之內不可重複。

## 合併頁

- 明顯的體重減輕／嚴重的體重減輕：E 共用；體位測量 S 門檻不同；其他 S 類通常相同。
- 第 11 頁肥胖相關：E 與 S 共用；只差 `definition`／名稱。

## 照片不完整

能看清的就填。其餘留空。告訴使用者還缺什麼（E 頁還是 S 頁）。

## 寫入 D1 之後

「寫入 D1」成功會把 staged 問題併入已發布目錄，並清空 staged 的 `problems`。下一次抽取從空的 `problems` 陣列開始。

若寫入失敗且錯誤為 `no such table: catalog_ingest`，請使用者執行 `npm run migrate` 後再試。
