---
name: extract-pes-problem
description: Extract one nutrition PES Problem (P) plus etiologies (E) and five-category signs (S) from handbook photos or text into data/staged/pes-catalog.json. Use when the user provides a P page, S table, 營養診斷 photos, or asks to extract/fill a PES problem.
---

# Extract one PES problem

Update **one existing problem** in `data/staged/pes-catalog.json`. Do not add a new P; match by Chinese `label`, English `labelEn`, or `page`.

Canonical example: `id: "underweight"`（體重過輕, p.8–9）.

## Workflow

1. Read `shared/pes.ts` and the target stub in `data/staged/pes-catalog.json`.
2. Transcribe from the photos/text. Do not invent missing E or S.
3. Fill only that problem: `definition`, `etiologies`, `signs`.
4. Keep `id`, `label`, `labelEn`, `page`, `domain` unless the index was clearly wrong.
5. If two P share a printed page (明顯／嚴重體重減輕; 第 11 頁肥胖群), still write **separate records**. Copy shared E/S, then apply only the differences.
6. After writing, typecheck if you touched TS. Tell the user to open `/internal/pes-preview?id=<problem-id>`.

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

## Example shape

See `underweight` in `data/staged/pes-catalog.json`. Preview shows that one object, not the whole catalog.
