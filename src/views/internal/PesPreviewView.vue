<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { isProblemExtracted, signCategoryLabel } from "@shared/catalog";
import type {
  CatalogResponse,
  CatalogValidation,
  PesCatalog,
} from "@shared/pes";
import { fetchPesCatalog, fetchStagedPesCatalog, publishStagedPesCatalog } from "@/lib/api";
import { groupProblemsByDomain } from "@/lib/groupProblems";

const stagedCatalog = ref<PesCatalog | null>(null);
const validation = ref<CatalogValidation | null>(null);
const runtimeSource = ref<CatalogResponse["source"] | null>(null);
const publishedVersion = ref<string | null>(null);
const loadError = ref<string | null>(null);
const publishMessage = ref<string | null>(null);
const publishing = ref(false);

const groups = computed(() =>
  stagedCatalog.value ? groupProblemsByDomain(stagedCatalog.value) : [],
);

const hasStagedProblems = computed(
  () => (stagedCatalog.value?.problems.length ?? 0) > 0,
);

const canPublish = computed(
  () =>
    validation.value?.ok === true &&
    hasStagedProblems.value &&
    !publishing.value,
);

onMounted(async () => {
  try {
    const [staged, runtime] = await Promise.all([
      fetchStagedPesCatalog(),
      fetchPesCatalog(),
    ]);
    stagedCatalog.value = staged.catalog;
    validation.value = staged.validation;
    runtimeSource.value = runtime.source;
    publishedVersion.value = runtime.version?.version ?? null;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});

async function handlePublish() {
  publishing.value = true;
  publishMessage.value = null;
  try {
    const result = await publishStagedPesCatalog();
    if (result.ok) {
      publishedVersion.value = result.version.version;
      runtimeSource.value = "d1";
      publishMessage.value = `已寫入 D1，版本 ${result.version.version}。staged 已清空。`;
      if (import.meta.env.DEV) {
        await fetch("/__dev/clear-staged", { method: "POST" }).catch(() => undefined);
      }
      const staged = await fetchStagedPesCatalog();
      stagedCatalog.value = staged.catalog;
      validation.value = staged.validation;
    }
  } catch (error) {
    publishMessage.value = error instanceof Error ? error.message : String(error);
  } finally {
    publishing.value = false;
  }
}
</script>

<template>
  <main class="page">
    <p class="eyebrow">建構階段</p>
    <h1>PES 資料預覽</h1>
    <p class="lede">
      顯示目前 staged 裡待入庫的抽取結果。確認後寫入 D1，並與既有目錄合併。
    </p>

    <p v-if="loadError" class="error">無法載入預覽：{{ loadError }}</p>

    <template v-else-if="stagedCatalog && validation">
      <section class="stat-grid">
        <article class="stat">
          <strong>{{ validation.stats.extracted }}</strong>
          <span>待入庫</span>
        </article>
        <article class="stat">
          <strong>{{ validation.stats.etiologies }}</strong>
          <span>病因</span>
        </article>
        <article class="stat">
          <strong>{{ validation.stats.signs }}</strong>
          <span>徵象</span>
        </article>
      </section>

      <p class="runtime-note">
        產生器目前讀取：
        <strong>{{ runtimeSource === "d1" ? "D1 已發布版" : "staged JSON（尚未入庫）" }}</strong>
        <span v-if="publishedVersion"> · {{ publishedVersion }}</span>
      </p>

      <section v-if="validation.errors.length" class="issue-list" data-level="error">
        <h2>錯誤（{{ validation.errors.length }}）</h2>
        <ul>
          <li v-for="issue in validation.errors" :key="issue.path + issue.message">
            <code>{{ issue.path }}</code> {{ issue.message }}
          </li>
        </ul>
      </section>

      <section v-if="validation.warnings.length" class="issue-list" data-level="warning">
        <h2>警告（{{ validation.warnings.length }}）</h2>
        <ul>
          <li v-for="issue in validation.warnings" :key="issue.path + issue.message">
            <code>{{ issue.path }}</code> {{ issue.message }}
          </li>
        </ul>
      </section>

      <p v-if="!hasStagedProblems" class="muted">目前沒有待入庫的抽取資料。</p>

      <template v-for="group in groups" :key="group.id">
        <section
          v-for="problem in group.items"
          :key="problem.id"
          class="catalog-group"
        >
          <p class="muted">
            {{ group.label }}
            · p.{{ problem.page }}
            · {{ isProblemExtracted(problem) ? "已抽取" : "尚未抽取" }}
          </p>
          <h2 class="problem-title">{{ problem.label }}</h2>
          <p v-if="problem.labelEn" class="muted">{{ problem.labelEn }}</p>
          <pre v-if="problem.definition" class="definition">{{ problem.definition }}</pre>
          <p v-else class="muted">尚無定義</p>

          <h3 class="etiology-heading">E（{{ problem.etiologies.length }}）</h3>
          <ol v-if="problem.etiologies.length" class="plain-list">
            <li v-for="item in problem.etiologies" :key="item.id">
              {{ item.label }}
              <span v-if="item.examples?.length" class="muted">
                （如：{{ item.examples.join("、") }}）
              </span>
            </li>
          </ol>
          <p v-else class="muted">無</p>

          <template v-for="category in problem.signs" :key="category.id">
            <h3 class="sign-category">{{ signCategoryLabel(category.id) }}</h3>
            <p v-if="!category.items.length" class="muted">無</p>
            <ul v-else class="plain-list">
              <li v-for="item in category.items" :key="item.id">
                <strong>{{ item.label }}</strong>
                <ul v-if="item.details?.length" class="detail-list">
                  <li v-for="detail in item.details" :key="detail">{{ detail }}</li>
                </ul>
              </li>
            </ul>
          </template>

          <h3 class="json-heading">此筆 JSON</h3>
          <pre class="raw-json">{{ JSON.stringify(problem, null, 2) }}</pre>
        </section>
      </template>

      <button
        v-if="hasStagedProblems"
        type="button"
        class="primary-btn"
        :disabled="!canPublish"
        @click="handlePublish"
      >
        {{ publishing ? "寫入中…" : "確認沒問題，寫入 D1" }}
      </button>
      <p v-if="publishMessage" class="publish-message">{{ publishMessage }}</p>
    </template>
  </main>
</template>
