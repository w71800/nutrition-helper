---
name: extract-pes-problem
description: Extract one nutrition PES Problem (P) plus etiologies (E) and five-category signs (S) from handbook photos or text into data/staged/pes-catalog.json. Use when the user provides a P page, S table, 營養診斷 photos, or asks to extract/fill a PES problem.
---

# Extract one PES problem

Write **the current extraction** into `data/staged/pes-catalog.json`. Staged `problems` should contain only this P (or the two P that share a printed page). Do not keep the rest of the catalog.

Match identity from `data/pes-index.json` by Chinese `label`, English `labelEn`, or `page`. Reuse that `id`, `label`, `labelEn`, `page`, and `domain` unless the index was clearly wrong.

## Workflow

1. Read `shared/pes.ts` and `data/pes-index.json`.
2. Transcribe from the photos/text. Do not invent missing E or S.
3. Keep staged `meta` and `domains`. Replace `problems` with the filled record(s) only.
4. If two P share a printed page (明顯／嚴重體重減輕; 第 11 頁肥胖群), still write **separate records**. Copy shared E/S, then apply only the differences.
5. After writing, typecheck if you touched TS. Tell the user to open `/internal/pes-preview`.

## Field rules

- `definition`: keep paper line breaks (`\n`). Age/BMI bullets stay in definition, not as E.
- Introductory E boilerplate（病理、生理、心理…）is **not** an etiology. Skip it.
- `etiologies[].label`: the cause sentence only.
- Parenthetical `如：…` → `examples: string[]`. Do not leave them inside `label`.
- `signs` must be exactly these five ids, in this order:

  1. `biochemical` 生化檢驗資料、醫療檢驗及步驟
  2. `anthropometric` 體位測量
  3. `nfpe` 營養相關理學檢查發現
  4. `food_nutrition_history` 飲食／營養紀錄
  5. `client_history` 個案史

- Category with 無 → `{ "id": "…", "items": [] }`. Do not omit the category.
- ● circle item → selectable `PesSign` (`id` + `label`).
- ◆ diamond / nested item → that sign’s `details[]`, not a child choice.
- Footnotes belong on the related sign’s `details`.
- `id` values: kebab-case English slugs, unique within that problem’s etiologies and within each sign category.

## Combined pages

- 明顯的體重減輕 / 嚴重的體重減輕: shared E; anthropometric S thresholds differ; other S categories usually identical.
- 第 11 頁肥胖相關: shared E and S; only `definition` / labels differ.

## Incomplete photos

Fill what is visible. Leave the rest empty. Say what is still missing (E page vs S page).

## After publish

Successful「寫入 D1」merges staged problems into the published catalog and clears staged `problems`. The next extraction starts from an empty `problems` array.
