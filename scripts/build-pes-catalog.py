#!/usr/bin/env python3
"""Build pes-catalog.json from NCPT 2023 publicly documented terminology."""

import json
from pathlib import Path

# (code, label_en, label_zh, domain, definition_en)
PROBLEMS = [
    # --- Intake (NI) — eNCPT 2023 Freely Available + 2023 taxonomy ---
    ("NI-1.4", "Inadequate energy intake", "能量攝取不足", "NI",
     "Energy intake that is less than energy expenditure, established reference standards, or recommendations based on physiological needs."),
    ("NI-1.5", "Excessive energy intake", "能量攝取過多", "NI",
     "Energy intake that exceeds energy expenditure, established reference standards, or recommendations based on physiological needs."),
    ("NI-2.1", "Inadequate oral intake", "經口攝取不足", "NI",
     "Oral food/beverage intake that is less than established reference standards or recommendations based on physiological needs."),
    ("NI-2.2", "Excessive oral intake", "經口攝取過多", "NI",
     "Oral food/beverage intake that exceeds established reference standards or recommendations based on physiological needs."),
    ("NI-2.3", "Inadequate enteral nutrition infusion", "腸道營養灌注不足", "NI",
     "Enteral infusion that provides fewer calories or nutrients compared to established reference standards or recommendations based on physiological needs."),
    ("NI-2.4", "Excessive enteral nutrition infusion", "腸道營養灌注過多", "NI",
     "Enteral infusion that provides more calories or nutrients compared to established reference standards or recommendations based on physiological needs."),
    ("NI-2.5", "Inadequate parenteral nutrition infusion", "靜脈營養灌注不足", "NI",
     "Parenteral infusion that provides fewer calories or nutrients compared to established reference standards or recommendations based on physiological needs."),
    ("NI-2.11", "Unbalanced diet pattern", "不均衡飲食型態", "NI",
     "Food and beverage intake that does not support optimal health (2023; moved from Behavioral-Environmental domain)."),
    ("NI-3.1", "Inadequate fluid intake", "液體攝取不足", "NI",
     "Lower intake of fluid-containing foods or substances compared to established reference standards or recommendations based on physiological needs."),
    ("NI-3.2", "Excessive fluid intake", "液體攝取過多", "NI",
     "Higher intake of fluid-containing foods or substances compared to established reference standards or recommendations based on physiological needs."),
    ("NI-4.3", "Excessive alcohol intake", "酒精攝取過多", "NI",
     "Alcohol intake that exceeds recommendations based on physiological needs or health status."),
    ("NI-5.1", "Increased nutrient needs", "營養素需求增加", "NI",
     "Requirement for specific nutrients above established reference standards due to physiological or pathological conditions."),
    ("NI-5.3", "Inadequate protein-energy intake", "蛋白質–能量攝取不足", "NI",
     "Lower intake of protein and/or energy compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.5.1", "Inadequate fat intake", "脂肪攝取不足", "NI",
     "Lower fat intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.5.2", "Excessive fat intake", "脂肪攝取過多", "NI",
     "Higher fat intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.6.1", "Inadequate protein intake", "蛋白質攝取不足", "NI",
     "Lower intake of protein compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.6.2", "Excessive protein intake", "蛋白質攝取過多", "NI",
     "Higher protein intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.8.1", "Inadequate carbohydrate intake", "碳水化合物攝取不足", "NI",
     "Lower carbohydrate intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.8.2", "Excessive carbohydrate intake", "碳水化合物攝取過多", "NI",
     "Higher carbohydrate intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.8.4", "Inconsistent carbohydrate intake", "碳水化合物攝取不一致", "NI",
     "Carbohydrate intake that varies in timing or amount in a way that interferes with nutrition-related health outcomes."),
    ("NI-5.8.5", "Inadequate fiber intake", "膳食纖維攝取不足", "NI",
     "Lower fiber intake compared to established reference standards or recommendations based on physiological needs."),
    ("NI-5.10.2", "Excessive mineral intake", "礦物質攝取過多", "NI",
     "Higher mineral intake compared to established reference standards (e.g., sodium)."),
    ("NI-5.2", "Malnutrition (undernutrition)", "營養不良（營養不足）", "NI",
     "Inadequate intake of protein and/or energy, over a period of time, sufficient to negatively impact growth/development, and/or to result in loss of fat and/or muscle stores."),
    ("NI-5.2.1", "Starvation related malnutrition", "飢餓相關營養不良", "NI",
     "Inadequate intake of protein and/or energy over a period of time sufficient to result in loss of fat and/or muscle mass without apparent inflammation and in environmental and/or social circumstances."),
    ("NI-5.2.2", "Chronic disease or condition related malnutrition", "慢性疾病相關營養不良", "NI",
     "Inadequate intake of protein and/or energy over a period of time sufficient to result in loss of fat and/or muscle mass with mild to moderate inflammation in the context of chronic illness."),
    ("NI-5.2.3", "Acute disease or injury related malnutrition", "急性疾病或傷害相關營養不良", "NI",
     "Inadequate intake of protein and/or energy resulting in loss of fat and/or muscle mass with marked inflammatory response in the context of acute illness or injury."),
    ("NI-5.2.4", "Non illness related pediatric malnutrition", "非疾病相關兒科營養不良", "NI",
     "Inadequate nutrient intake due to environmental or behavioral factors which may negatively affect growth, development, and/or other outcomes."),
    ("NI-5.2.5", "Illness related pediatric malnutrition", "疾病相關兒科營養不良", "NI",
     "Nutrient deficit or imbalance due to disease or injury which may negatively affect growth, development, and/or other outcomes."),
    # --- Clinical (NC) ---
    ("NC-1.1", "Swallowing difficulty", "吞嚥困難", "NC",
     "Impaired or difficult movement of food and liquid within the oral cavity to the stomach."),
    ("NC-1.2", "Difficulty chewing", "咀嚼困難", "NC",
     "Impaired ability to chew food (2023; replaces biting/chewing difficulty)."),
    ("NC-1.4", "Altered GI function", "胃腸功能改變", "NC",
     "Change in gastrointestinal function that interferes with or prevents desired nutritional consequences."),
    ("NC-1.6", "Sarcopenia", "肌少症", "NC",
     "Loss of skeletal muscle mass and function (2023 new diagnosis)."),
    ("NC-2.1", "Impaired nutrient utilization", "營養素利用障礙", "NC",
     "Change in capacity to metabolize nutrients as a result of medications, surgery, or pathophysiology."),
    ("NC-2.2", "Altered nutrition-related laboratory values", "營養相關檢驗值異常", "NC",
     "Laboratory values indicating altered nutrition status (specify lab)."),
    ("NC-2.3", "Food-medication interaction", "食物–藥物交互作用", "NC",
     "Actual or potential interaction between food and medication affecting nutrition outcomes."),
    ("NC-3.1", "Underweight", "體重過輕", "NC",
     "Body weight below established reference standards or recommendations."),
    ("NC-3.2", "Unintended weight loss", "非刻意體重下降", "NC",
     "Decrease in body weight that is not planned or desired."),
    ("NC-3.3", "Overweight/obesity", "過重／肥胖", "NC",
     "Increased adiposity compared to established reference standards, ranging from overweight to obesity."),
    ("NC-3.4", "Unintended weight gain", "非刻意體重增加", "NC",
     "Increase in body weight that is not planned or desired."),
    # --- Behavioral-Environmental (NB) — 2023 names ---
    ("NB-1.1", "Food and nutrition related knowledge deficit", "食物與營養相關知識不足", "NB",
     "Incomplete or inaccurate knowledge about food, nutrition, or nutrition-related information and guidelines."),
    ("NB-1.3", "Not ready for nutrition related behavior change", "尚未準備好進行營養相關行為改變", "NB",
     "Lack of readiness to change food or nutrition-related behaviors (2023 label)."),
    ("NB-1.4", "Self-monitoring deficit", "自我監測能力不足", "NB",
     "Inability or limited ability to monitor food, nutrition, or related health parameters."),
    ("NB-1.5", "Disordered eating pattern", "紊亂飲食型態", "NB",
     "Eating pattern that interferes with optimal nutrition and health."),
    ("NB-1.6", "Limited adherence to nutrition-related recommendations", "營養建議遵從性不足", "NB",
     "Difficulty following agreed-upon nutrition recommendations."),
    ("NB-1.7", "Limited food acceptance", "食物接受度有限", "NB",
     "Limited willingness or ability to accept appropriate foods (2023; moved to Behavioral-Environmental)."),
    ("NB-1.8", "Limited food and nutrition related skill", "食物與營養相關技能不足", "NB",
     "Limited practical skills for food selection, preparation, or nutrition self-management (2023 new)."),
    ("NB-1.9", "Belief finding that hinders food and/or nutrition behavior change", "阻礙飲食／營養行為改變之信念", "NB",
     "Beliefs that hinder adoption of recommended food or nutrition behaviors (2023)."),
    ("NB-1.10", "Attitude finding that hinders food and/or nutrition behavior change", "阻礙飲食／營養行為改變之態度", "NB",
     "Attitudes that hinder adoption of recommended food or nutrition behaviors (2023)."),
    ("NB-2.1", "Physical inactivity", "身體活動不足", "NB",
     "Physical activity below recommendations for health."),
    ("NB-2.3", "Inability or lack of desire to manage self-care", "無法或不願自我照護", "NB",
     "Inability or lack of desire to perform nutrition-related self-care."),
    ("NB-2.4", "Limited ability to prepare food for eating", "備餐能力有限", "NB",
     "Limited ability to prepare food for consumption (2023 label)."),
    ("NB-2.5", "Poor food and/or nutrition quality of life", "食物／營養生活品質不佳", "NB",
     "Self-reported poor quality of life related to food or nutrition."),
    ("NB-2.6", "Self-feeding difficulty", "自行進食困難", "NB",
     "Difficulty feeding oneself independently."),
    ("NB-3.1", "Intake of unsafe food", "攝取不安全食物", "NB",
     "Consumption of food that poses safety risk."),
    ("NB-3.2", "Food insecurity", "食物不安全", "NB",
     "Uncertain, limited, or unstable access to adequate, safe, culturally acceptable food (2023; relabeled from limited access to food)."),
]

# Typical etiologies and signs per problem (from public NCP teaching, 2023 examples, reference sheet patterns)
# Not exhaustive vs. paid eNCPT reference sheets.
PES_LINKS: dict[str, list[tuple[str, str, list[tuple[str, str]]]]] = {
    "NI-1.4": [
        ("early-satiety", "提早飽足感", [("intake-below-needs", "估計攝取低於需求"), ("weight-loss", "體重下降")]),
        ("swallowing-difficulty", "吞嚥困難", [("meals-under-25pct", "進食量 <25%"), ("weight-loss-reported", "自述體重減輕")]),
        ("increased-energy-needs-unmet", "能量需求增加未滿足", [("intake-below-75pct", "攝取 <75% 計算需求"), ("hypermetabolism", "代謝亢進狀態")]),
    ],
    "NI-1.5": [
        ("binge-eating", "暴食行為", [("loss-of-control-eating", "進食失控感"), ("large-portion-episodes", "大量進食發作")]),
        ("high-calorie-foods", "高熱量食物", [("rapid-weight-gain", "體重快速增加"), ("intake-exceeds-needs", "攝取超過需求")]),
        ("freq-eating-out", "外食頻率高", [("large-portion", "餐量偏大"), ("sweet-drinks", "含糖飲料攝取")]),
    ],
    "NI-2.1": [
        ("anorexia", "食慾不振", [("intake-below-needs", "估計攝取低於需求"), ("weight-loss", "體重下降")]),
        ("nausea-vomiting", "噁心嘔吐", [("meal-skipping", "常跳餐"), ("low-appetite", "食慾差")]),
    ],
    "NI-2.2": [
        ("large-portions", "餐量過大", [("intake-exceeds-needs", "攝取超過需求"), ("weight-gain", "體重增加")]),
    ],
    "NI-2.3": [
        ("poor-tolerance-rate", "灌注速率耐受差", [("diarrhea", "腹瀉"), ("tube-feed-holds", "管灌多次中斷")]),
        ("tube-feed-interrupted", "管灌中斷", [("weight-loss-recent", "近期體重下降"), ("intake-below-order", "實際灌注低於醫囑")]),
    ],
    "NI-2.4": [
        ("overfeeding-order", "過度灌注醫囑", [("gi-tolerance-poor", "腸胃耐受不良"), ("weight-gain-unintended", "非刻意體重增加")]),
    ],
    "NI-2.5": [
        ("pn-not-initiated", "靜脈營養尚未開始", [("intake-minimal", "攝取極少"), ("catabolic-state", "分解代謝狀態")]),
    ],
    "NI-2.11": [
        ("limited-variety", "食物種類受限", [("refined-grains-daily", "每日精製穀物"), ("low-veg-fruit", "蔬果攝取不足")]),
        ("convenience-foods", "依賴便利／外食", [("high-sodium-pattern", "高鈉飲食型態"), ("unbalanced-macros", "巨量營養素比例失衡")]),
    ],
    "NI-3.1": [
        ("fear-incontinence", "擔心失禁而限水", [("fluid-intake-low", "估計液體攝取偏低"), ("poor-skin-turgor", "皮膚彈性變差")]),
        ("limited-access-fluids", "取得液體不便", [("dehydration-signs", "脫水相關徵象"), ("intake-below-needs", "液體攝取低於需求")]),
    ],
    "NI-3.2": [
        ("excess-beverages", "飲料攝取過多", [("fluid-intake-high", "液體攝取超過需求"), ("edema", "水腫")]),
    ],
    "NI-4.3": [
        ("social-drinking", "社交飲酒", [("alcohol-exceeds-guideline", "酒精攝取超過建議"), ("empty-calories", "空熱量來源增加")]),
    ],
    "NI-5.1": [
        ("wound-healing", "傷口癒合需求", [("increased-protein-needs", "蛋白質需求增加"), ("weight-loss-or-low-intake", "體重下降或攝取不足")]),
        ("burn-injury", "燒燙傷", [("hypermetabolism", "代謝亢進"), ("intake-below-needs", "攝取低於需求")]),
    ],
    "NI-5.3": [
        ("early-satiety", "提早飽足感", [("intake-50pct-needs", "攝取約 50% 需求"), ("clothes-loose", "衣物變鬆")]),
        ("poor-appetite", "食慾差", [("meal-skipping", "常跳餐"), ("muscle-wasting", "肌肉消耗")]),
    ],
    "NI-5.5.2": [
        ("high-fat-foods", "高脂食物", [("serum-lipids-elevated", "血脂升高"), ("fat-intake-high", "脂肪攝取偏高")]),
    ],
    "NI-5.6.1": [
        ("food-aversions", "食物厭惡", [("protein-intake-low", "蛋白質攝取偏低"), ("temporal-wasting", "顳部消瘦")]),
    ],
    "NI-5.6.2": [
        ("high-protein-supplements-excess", "過量蛋白補充", [("protein-intake-high", "蛋白質攝取超過需求"), ("renal-stress", "腎臟負荷增加風險")]),
    ],
    "NI-5.8.2": [
        ("knowledge-deficit-carb", "碳水化合物知識不足", [("hba1c-elevated", "糖化血色素升高"), ("irregular-carb-intake", "醣類攝取不規則")]),
        ("large-portions-starch", "澱粉餐量過大", [("postprandial-glucose-high", "飯後血糖偏高"), ("carb-intake-high", "碳水化合物攝取過多")]),
    ],
    "NI-5.8.4": [
        ("irregular-meal-timing", "進餐時間不規則", [("glycemic-variability", "血糖波動大"), ("skipped-meals", "常跳餐")]),
    ],
    "NI-5.8.5": [
        ("limited-high-fiber-foods", "高纖食物取得有限", [("refined-grains-daily", "每日精製穀物"), ("veg-under-2-servings", "蔬菜 <2 份／週")]),
    ],
    "NI-5.10.2": [
        ("reliance-fast-food", "依賴速食／外食", [("sodium-intake-high", "鈉攝取過高"), ("ankle-edema", "踝部水腫"), ("bp-elevated", "血壓偏高")]),
    ],
    "NI-5.2.1": [
        ("depression", "憂鬱", [("weight-loss-30pct-year", "一年體重下降 ≥30%"), ("meal-skipping-frequent", "經常跳餐")]),
        ("food-insecurity", "食物不安全", [("muscle-loss", "肌肉流失"), ("intake-inadequate", "攝取長期不足")]),
    ],
    "NI-5.2.2": [
        ("chronic-illness", "慢性疾病", [("weight-loss-5pct-month", "一個月體重下降 ≥5%"), ("intake-under-75pct", "能量攝取 <75% 需求")]),
        ("cancer", "癌症", [("inflammation-mild-moderate", "輕中度發炎"), ("fat-muscle-loss", "脂肪／肌肉流失")]),
    ],
    "NI-5.2.3": [
        ("increased-energy-needs", "能量需求增加", [("large-wound-burn", "大面積傷口／燒傷"), ("intake-under-25pct", "進食 <25%"), ("edema", "水腫")]),
    ],
    "NI-5.2.4": [
        ("food-insecurity", "食物不安全", [("growth-faltering", "生長遲緩"), ("weight-for-age-low", "年齡別體重偏低")]),
        ("picky-eating", "挑食", [("limited-food-variety", "食物多樣性不足"), ("intake-inadequate", "攝取不足")]),
    ],
    "NI-5.2.5": [
        ("chronic-pediatric-illness", "兒科慢性疾病", [("growth-chart-decline", "生長曲線下滑"), ("intake-below-needs", "攝取低於需求")]),
    ],
    "NI-5.5.1": [
        ("fat-restricted-diet-unnecessary", "不必要之低脂飲食", [("fat-intake-below-needs", "脂肪攝取低於需求"), ("essential-fatty-acid-risk", "必需脂肪酸不足風險")]),
    ],
    "NI-5.8.1": [
        ("carb-restriction", "碳水化合物限制過嚴", [("carb-intake-low", "碳水化合物攝取偏低"), ("hypoglycemia-risk", "低血糖風險")]),
    ],
    "NI-5.2": [
        ("inadequate-intake-prolonged", "長期攝取不足", [("muscle-loss", "肌肉流失"), ("subcutaneous-fat-loss", "皮下脂肪減少")]),
    ],
    "NC-1.1": [
        ("neurologic-disorder", "神經肌肉疾病", [("aspiration-risk", "吸入風險"), ("meals-under-25pct", "進食量 <25%")]),
        ("post-stroke", "中風後", [("prolonged-meal-time", "進餐時間延長"), ("coughing-with-meals", "進食時咳嗽")]),
    ],
    "NC-1.2": [
        ("oral-pain", "口腔疼痛", [("avoids-solid-foods", "避開固體食物"), ("soft-diet-only", "僅能軟質飲食")]),
    ],
    "NC-1.4": [
        ("gi-disorder", "胃腸疾病", [("nausea-bloating", "噁心／脹氣"), ("early-satiety", "提早飽足感")]),
    ],
    "NC-1.6": [
        ("low-protein-intake", "蛋白質攝取不足", [("protein-below-target", "蛋白質低於目標"), ("muscle-mass-low", "肌肉量偏低")]),
        ("physical-inactivity", "身體活動不足", [("grip-strength-low", "握力下降"), ("steps-low", "步數偏低")]),
    ],
    "NC-2.2": [
        ("diabetes-mellitus", "糖尿病", [("fasting-glucose-high", "空腹血糖偏高"), ("hba1c-elevated", "糖化血色素升高")]),
    ],
    "NC-2.1": [
        ("malabsorption", "吸收不良", [("weight-loss", "體重下降"), ("nutrient-labs-abnormal", "營養相關檢驗異常")]),
    ],
    "NC-2.3": [
        ("grapefruit-statin", "葡萄柚與 statin 交互", [("medication-counseling-needed", "需藥食衛教"), ("diet-nonadherence-risk", "飲食遵從風險")]),
    ],
    "NC-3.2": [
        ("early-satiety", "提早飽足感", [("intake-50pct-needs", "攝取約 50% 需求"), ("clothes-loose", "衣物變鬆")]),
        ("hypermetabolism", "代謝亢進", [("weight-loss-unintended", "非刻意體重下降"), ("increased-needs", "需求增加")]),
    ],
    "NC-3.3": [
        ("physical-inactivity", "身體活動不足", [("steps-low", "步數偏低"), ("bmi-elevated", "BMI 升高")]),
        ("excessive-energy-intake", "能量攝取過多", [("weight-gain", "體重增加"), ("portion-large", "餐量過大")]),
    ],
    "NC-3.4": [
        ("physical-inactivity", "身體活動不足", [("activity-decreased", "活動量減少"), ("weight-gain-6pct", "體重增加 ≥6%")]),
    ],
    "NC-3.1": [
        ("inadequate-intake", "攝取不足", [("bmi-low", "BMI 過低"), ("muscle-wasting", "肌肉消耗")]),
    ],
    "NB-1.1": [
        ("limited-prior-education", "過去營養衛教有限", [("patient-quote-knowledge-gap", "個案自述認知不足"), ("incorrect-beliefs", "錯誤飲食觀念")]),
    ],
    "NB-1.3": [
        ("time-constraints-perceived", "自覺時間不足", [("states-no-time-healthy-eating", "自述無法健康飲食"), ("takeout-frequent", "常外帶")]),
    ],
    "NB-1.4": [
        ("no-glucometer-training", "未接受血糖機教學", [("unopened-glucometer", "血糖機未開封"), ("blank-logs", "監測紀錄空白")]),
    ],
    "NB-1.5": [
        ("binge-restrict-cycle", "暴食–限制循環", [("loss-of-control", "進食失控"), ("weight-fluctuation", "體重波動")]),
    ],
    "NB-1.6": [
        ("cognitive-deficit", "認知功能不足", [("cannot-teach-back", "無法教回衛教內容"), ("plate-method-not-used", "未使用餐盤法")]),
    ],
    "NB-1.7": [
        ("nausea-aversions", "噁心／食物厭惡", [("food-refusal", "拒食"), ("frustration-with-eating", "對進食感到挫折")]),
    ],
    "NB-1.8": [
        ("limited-cooking-skills", "烹調技能不足", [("relies-takeout", "依賴外食"), ("cannot-follow-recipe", "無法依食譜備餐")]),
    ],
    "NB-1.9": [
        ("unsupported-belief-fad-diet", "不支持之飲食信念", [("restricts-food-groups", "不必要限制食物類別"), ("resists-recommendation", "抗拒建議")]),
    ],
    "NB-1.10": [
        ("negative-attitude-change", "對改變持負向態度", [("states-change-futile", "自述改變無用"), ("low-motivation", "動機低")]),
    ],
    "NB-2.1": [
        ("knowledge-deficit-activity", "活動益處知識不足", [("no-structured-activity", "無規律活動"), ("sedentary-time-high", "久坐時間長")]),
    ],
    "NB-2.3": [
        ("fatigue", "疲倦", [("meal-skipping", "常跳餐"), ("intake-decreased", "整體攝取下降")]),
    ],
    "NB-2.4": [
        ("fatigue", "疲倦", [("meal-skipping", "常跳餐"), ("relies-others-meals", "依賴他人備餐")]),
    ],
    "NB-2.5": [
        ("gi-symptoms", "腸胃症狀", [("reports-poor-qol-eating", "自述進食生活品質差"), ("avoids-social-meals", "避免社交進餐")]),
    ],
    "NB-2.6": [
        ("weakness-hands", "手部無力", [("needs-feeding-assist", "需他人協助進食"), ("meal-time-prolonged", "進餐時間過長")]),
    ],
    "NB-3.1": [
        ("improper-food-storage", "食物儲存不當", [("reports-gi-illness", "自述腸胃不適"), ("unsafe-food-practices", "不安全食物處理")]),
    ],
    "NB-3.2": [
        ("financial-constraints", "經濟因素", [("skips-meals-cost", "因成本跳餐"), ("food-pantry-reliance", "依賴食物銀行")]),
    ],
}

DOMAIN_LABELS = {
    "NI": {"en": "Intake", "zh": "攝取"},
    "NC": {"en": "Clinical", "zh": "臨床"},
    "NB": {"en": "Behavioral-Environmental", "zh": "行為－環境"},
}


def slug(code: str) -> str:
    return code.lower().replace(".", "-")


def build():
    problems = []
    for code, label_en, label_zh, domain, definition in PROBLEMS:
        pid = slug(code)
        etiologies = []
        for eid, elabel_zh, signs in PES_LINKS.get(code, []):
            if isinstance(signs, str):
                # fix typo entry
                continue
            etiologies.append({
                "id": eid,
                "label": elabel_zh,
                "labelEn": eid.replace("-", " ").title(),
                "signs": [
                    {"id": sid, "label": slabel, "labelEn": sid.replace("-", " ")}
                    for sid, slabel in signs
                ],
            })
        # Default minimal E/S if missing
        if not etiologies:
            etiologies = [{
                "id": "unspecified-etiology",
                "label": "病因待進一步評估",
                "labelEn": "Etiology to be specified",
                "signs": [
                    {"id": "assessment-pending", "label": "待營養評估確認之客觀資料", "labelEn": "Pending assessment data"},
                ],
            }]
        problems.append({
            "id": pid,
            "code": code,
            "domain": domain,
            "domainLabel": DOMAIN_LABELS[domain]["zh"],
            "label": label_zh,
            "labelEn": label_en,
            "definition": definition,
            "etiologies": etiologies,
        })

    return {
        "meta": {
            "edition": "2023",
            "terminology": "NCPT / eNCPT",
            "publishedBy": "Academy of Nutrition and Dietetics",
            "lastUpdated": "2026-06-05",
            "sources": [
                "https://www.ncpro.org/freely-available-ncp-terms (2023 English edition, Nutrition Diagnosis terms)",
                "https://www.ncpro.org/vault/2570/web/files/NCPT%202023%20Change%20Summary%20Table%20-%20ND.pdf",
                "Public NCP diagnostic taxonomy reference (IDNT-era structure, codes mapped to 2023 renames)",
            ],
            "disclaimer": "完整病因（E）與徵象／症狀（S）清單以訂閱 eNCPT 之診斷參考表為準；本檔收錄 2023 公開術語與常見教學用 PES 組合，供臨床選擇輔助，非取代官方授權資料庫。",
            "pesFormat": "[Problem] related to [Etiology] as evidenced by [Signs/Symptoms]",
        },
        "domains": [
            {"id": "NI", "label": "攝取", "labelEn": "Intake"},
            {"id": "NC", "label": "臨床", "labelEn": "Clinical"},
            {"id": "NB", "label": "行為－環境", "labelEn": "Behavioral-Environmental"},
        ],
        "problems": problems,
    }


def main():
    out = Path(__file__).resolve().parents[1] / "data" / "staged" / "pes-catalog.json"
    data = build()
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(data['problems'])} problems to {out}")


if __name__ == "__main__":
    main()
