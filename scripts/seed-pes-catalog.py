#!/usr/bin/env python3
"""Seed Domain/P stubs plus the extracted 體重過輕 example."""

import json
from pathlib import Path

SIGN_IDS = [
    "biochemical",
    "anthropometric",
    "nfpe",
    "food_nutrition_history",
    "client_history",
]


def empty_signs():
    return [{"id": category_id, "items": []} for category_id in SIGN_IDS]


def stub(problem_id, label, label_en, page, domain):
    return {
        "id": problem_id,
        "label": label,
        "labelEn": label_en,
        "page": page,
        "domain": domain,
        "etiologies": [],
        "signs": empty_signs(),
    }


UNDERWEIGHT = {
    "id": "underweight",
    "label": "體重過輕",
    "labelEn": "Underweight",
    "definition": "成人：BMI < 18.5 kg/m²\n2~18 歲：BMI ≤ 各年齡層第 15 百分位",
    "page": 8,
    "domain": "anthropometrics",
    "etiologies": [
        {
            "id": "incorrect-food-nutrition-beliefs",
            "label": "照顧者或個案本身對食物及營養相關議題有錯誤認知及態度",
        },
        {"id": "inadequate-energy-intake", "label": "熱量攝取不足"},
        {"id": "increased-energy-needs", "label": "熱量需求增加"},
        {"id": "excessive-activity", "label": "活動量過大"},
        {"id": "food-taboos-or-restrictions", "label": "食物攝取禁忌或限制"},
        {"id": "eating-disorder", "label": "飲食失調"},
        {"id": "environmental-or-economic-factors", "label": "環境或經濟因素"},
        {
            "id": "fetal-growth-restriction",
            "label": "胎兒體重小於妊娠週數、子宮內生長遲緩／受限、或每日體重增加不足",
        },
    ],
    "signs": [
        {"id": "biochemical", "items": []},
        {
            "id": "anthropometric",
            "items": [
                {"id": "bmi-adult-under-18-5", "label": "BMI < 18.5 kg/m²（成人）"},
                {
                    "id": "decreased-skinfold-and-mamc",
                    "label": "皮下脂肪厚度、中臂肌肉圍減少",
                },
                {
                    "id": "age-birth-to-2",
                    "label": "出生–2 歲",
                    "details": [
                        "體重 < 各年齡層第 5 百分位",
                        "重高指數 < 各年齡層第 5 百分位（備註：針對臥姿身長生長曲線圖，適合 36 個月以下嬰幼兒。若量測兒童站姿身高，使用 2–20 歲 BMI 表）",
                    ],
                },
                {
                    "id": "age-2-to-20",
                    "label": "2–20 歲",
                    "details": [
                        "體重 < 各年齡層第 5 百分位",
                        "BMI < 各年齡層第 5 百分位",
                        "體重與身高比值 < 各年齡層第 5 百分位",
                    ],
                },
            ],
        },
        {
            "id": "nfpe",
            "items": [
                {"id": "thinness-low-body-fat", "label": "體瘦、缺乏體脂肪"},
                {"id": "muscle-wasting", "label": "肌肉變少（臀部及顳肌耗損）"},
            ],
        },
        {
            "id": "food_nutrition_history",
            "items": [
                {
                    "id": "intake-below-reference",
                    "label": "食物攝取量較既定參考標準或個人生理需求的建議量低",
                },
                {"id": "inadequate-food-supply", "label": "食物供應不足"},
                {"id": "dieting-or-fad-diets", "label": "節食、不良的飲食流行時尚"},
                {"id": "prolonged-starvation", "label": "長期飢餓"},
                {"id": "food-refusal", "label": "拒絕進食"},
                {"id": "activity-above-recommended", "label": "活動量大於建議的活動量"},
                {"id": "appetite-affecting-drugs", "label": "使用影響食慾的藥物"},
            ],
        },
        {
            "id": "client_history",
            "items": [
                {
                    "id": "malnutrition-micronutrient-deficiency",
                    "label": "營養不良，維生素、礦物質缺乏",
                },
                {"id": "disease-or-disability", "label": "有疾病或身心殘障"},
                {
                    "id": "mental-disorder-or-dementia",
                    "label": "有精神障礙或失智疾病",
                },
                {"id": "hypermetabolism", "label": "新陳代謝速率過高"},
                {"id": "dancer-or-gymnast", "label": "舞蹈、體操等運動員"},
                {
                    "id": "neglected-child",
                    "label": "照顧不當之幼兒",
                    "details": ["包括：父母觀念不正確、無人妥善照顧等因素"],
                },
                {"id": "food-preferences", "label": "有飲食偏好"},
            ],
        },
    ],
}

PROBLEMS = [
    UNDERWEIGHT,
    stub("overweight", "體重過重", "Overweight", 11, "anthropometrics"),
    stub("mild-obesity", "輕度肥胖", "Mild obesity", 11, "anthropometrics"),
    stub("moderate-obesity", "中度肥胖", "Moderate obesity", 11, "anthropometrics"),
    stub("severe-obesity", "重度肥胖", "Severe obesity", 11, "anthropometrics"),
    stub("morbid-obesity", "病態性肥胖", "Morbid obesity", 11, "anthropometrics"),
    stub("abdominal-obesity", "腹部肥胖", "Abdominal obesity", 11, "anthropometrics"),
    stub(
        "excessive-body-fat-percent",
        "體脂肪百分比過高",
        "Excessive percentage of body fat",
        11,
        "anthropometrics",
    ),
    stub("normal-body-weight", "體位正常", "Body weight in normal range", 14, "anthropometrics"),
    stub("significant-weight-loss", "明顯的體重減輕", "Significant weight loss", 15, "anthropometrics"),
    stub("severe-weight-loss", "嚴重的體重減輕", "Severe weight loss", 15, "anthropometrics"),
    stub("mild-pem", "輕度蛋白質-熱量營養不良", "Mild PEM", 17, "nutritional-status"),
    stub("moderate-pem", "中度蛋白質-熱量營養不良", "Moderate PEM", 20, "nutritional-status"),
    stub("severe-pem", "重度蛋白質-熱量營養不良", "Severe PEM", 23, "nutritional-status"),
    stub("kwashiorkor", "夸西柯病", "Kwashiorkor", 25, "nutritional-status"),
    stub("marasmus", "消瘦症", "Marasmus", 27, "nutritional-status"),
    stub("excessive-caloric-intake", "熱量攝取過多", "Excessive caloric intake", 29, "energy-intake"),
    stub("adequate-caloric-intake", "熱量攝取足夠", "Adequate caloric intake", 31, "energy-intake"),
    stub("inadequate-caloric-intake", "熱量攝取不足", "Inadequate caloric intake", 32, "energy-intake"),
    stub("extreme-energy-restriction", "極度熱量限制", "Extreme energy restriction", 34, "energy-intake"),
    stub("excessive-carbohydrate-intake", "碳水化合物攝取過多", "Excessive carbohydrate intake", 35, "nutrient-intake"),
    stub("inadequate-carbohydrate-intake", "碳水化合物攝取偏低", "Inadequate carbohydrate intake", 37, "nutrient-intake"),
    stub("excessive-sugar-intake", "精製糖攝取過多", "Excessive sugar intake", 39, "nutrient-intake"),
    stub("excessive-total-fat-intake", "脂肪攝取過多", "Excessive total fat intake", 40, "nutrient-intake"),
    stub("inadequate-total-fat-intake", "脂肪攝取偏低", "Inadequate total fat intake", 42, "nutrient-intake"),
    stub("excessive-sfa-intake", "飽和脂肪酸攝取過多", "Excessive SFA intake", 44, "nutrient-intake"),
    stub("excessive-pufa-intake", "多元不飽和脂肪酸攝取過多", "Excessive PUFA intake", 45, "nutrient-intake"),
    stub("excessive-mufa-intake", "單元不飽和脂肪酸攝取過多", "Excessive MUFA intake", 46, "nutrient-intake"),
    stub("low-carb-high-fat-intake", "低碳水化合物高脂肪攝取", "Low carbohydrate, high fat intake", 47, "nutrient-intake"),
    stub("excessive-protein-intake", "蛋白質攝取過多", "Excessive protein intake", 48, "nutrient-intake"),
    stub("inadequate-protein-intake", "蛋白質攝取偏低", "Inadequate protein intake", 50, "nutrient-intake"),
    stub("inadequate-hbv-protein-intake", "高生理價蛋白質攝取不足", "Inadequate HBV protein intake", 52, "nutrient-intake"),
    stub("excessive-fiber-intake", "膳食纖維攝取過多", "Excessive dietary fiber intake", 53, "nutrient-intake"),
    stub("inadequate-fiber-intake", "膳食纖維攝取不足", "Inadequate dietary fiber intake", 55, "nutrient-intake"),
    stub("excessive-cholesterol-intake", "膽固醇攝取過多", "Excessive cholesterol intake", 57, "nutrient-intake"),
    stub("excessive-mineral-intake", "礦物質攝取過多", "Excessive mineral intake", 58, "nutrient-intake"),
    stub("inadequate-mineral-intake", "礦物質攝取偏低", "Inadequate mineral intake", 61, "nutrient-intake"),
    stub("excessive-vitamin-intake", "維生素攝取過多", "Excessive vitamin intake", 64, "nutrient-intake"),
    stub("inadequate-vitamin-intake", "維生素攝取偏低", "Inadequate vitamin intake", 66, "nutrient-intake"),
    stub("excessive-fluid-intake", "水份攝取過多", "Excessive fluid intake", 69, "nutrient-intake"),
    stub("inadequate-fluid-intake", "水分攝取不足", "Inadequate fluid intake", 72, "nutrient-intake"),
    stub("imbalance-of-nutrients", "營養素不均衡", "Imbalance of nutrients", 74, "nutrient-intake"),
    stub("inadequate-en-infusion", "腸道營養灌食不足", "Inadequate enteral nutrition infusion", 76, "nutrient-intake"),
    stub("excessive-en-infusion", "腸道營養灌食過多", "Excessive enteral nutrition infusion", 78, "nutrient-intake"),
    stub("inadequate-pn-infusion", "靜脈營養量不足", "Inadequate parenteral nutrition infusion", 79, "nutrient-intake"),
    stub("excessive-pn-infusion", "靜脈營養量過多", "Excessive parenteral nutrition infusion", 81, "nutrient-intake"),
    stub("food-medication-interaction", "食物與藥物交互作用", "Food-medication interaction", 82, "nutrient-intake"),
    stub("swallowing-difficulty", "吞嚥困難", "Swallowing difficulty", 83, "physiological"),
    stub("masticatory-difficulty", "咀嚼困難", "Masticatory difficulty", 85, "physiological"),
    stub("altered-gi-function", "腸胃道功能改變", "Altered gastrointestinal (GI) function", 87, "physiological"),
    stub("impaired-nutrient-utilization", "營養素利用變差", "Impaired nutrient utilization", 89, "physiological"),
    stub("altered-nutrition-labs", "營養相關生化值改變", "Altered nutrition-related laboratory values", 91, "physiological"),
    stub("breastfeeding-difficulty", "餵食母乳困難", "Breastfeeding difficulty", 93, "physiological"),
    stub("excessive-alcohol-intake", "飲酒過量", "Excessive alcohol intake", 95, "diet-behavior"),
    stub("limited-access-to-food-or-fluid", "獲取食物或水的管道受限", "Limited access to food and/or fluid", 97, "diet-behavior"),
    stub("food-nutrition-knowledge-deficit", "食物與營養的知識缺乏", "Food- and nutrition-related knowledge deficit", 99, "diet-behavior"),
    stub("harmful-food-beliefs", "不適當的營養態度", "Harmful beliefs/attitudes or practices about food, nutrition, and nutrition-related topics", 101, "diet-behavior"),
    stub("not-ready-for-change", "尚未準備好進行飲食或生活型態的改變", "Not ready for diet/lifestyle change", 102, "diet-behavior"),
    stub("self-compliance-deficit", "自我執行能力不足", "Self-compliance deficit", 104, "diet-behavior"),
    stub("limited-adherence", "無法確實執行營養相關建議", "Limited adherence to nutrition-related recommendations", 106, "diet-behavior"),
    stub("undesirable-food-choices", "不適當的食物選擇", "Undesirable food choices", 108, "diet-behavior"),
    stub("inadequate-exercise", "運動不足", "Inadequate exercise", 110, "diet-behavior"),
    stub("no-nutrition-problem", "此刻沒有營養相關問題", "Without nutritional related problem recently", 111, "diet-behavior"),
]


def main():
    catalog = {
        "meta": {
            "terminology": "中文版營養診斷條目",
            "lastUpdated": "2026-08-22",
            "disclaimer": "資料依紙本營養診斷手冊整理，供營養師工作輔助。完整內容以紙本為準。",
            "pesFormat": "P：… / E：… / S：…",
        },
        "domains": [
            {"id": "anthropometrics", "label": "體位", "labelEn": "Anthropometrics"},
            {"id": "nutritional-status", "label": "營養狀況", "labelEn": "Nutritional status"},
            {"id": "energy-intake", "label": "熱量攝取", "labelEn": "Energy intake"},
            {"id": "nutrient-intake", "label": "營養素攝取", "labelEn": "Nutrient intake"},
            {"id": "physiological", "label": "生理功能", "labelEn": "Physiological function"},
            {"id": "diet-behavior", "label": "飲食型態與行為", "labelEn": "Dietary patterns and behavior"},
        ],
        "problems": PROBLEMS,
    }

    out = Path(__file__).resolve().parents[1] / "data" / "staged" / "pes-catalog.json"
    out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    extracted = sum(1 for p in PROBLEMS if p.get("definition") or p["etiologies"])
    print(f"Wrote {len(PROBLEMS)} problems ({extracted} extracted) to {out}")


if __name__ == "__main__":
    main()
