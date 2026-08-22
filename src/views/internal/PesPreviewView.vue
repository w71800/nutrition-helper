<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchPesCatalog, fetchStagedPesCatalog, publishStagedPesCatalog } from "@/lib/api";
import { groupProblemsByDomain } from "@/lib/groupProblems";
import type {
  CatalogResponse,
  CatalogValidation,
  PesCatalog,
} from "@shared/pes";

const stagedCatalog = ref<PesCatalog | null>(null);
const validation = ref<CatalogValidation | null>(null);
const runtimeSource = ref<CatalogResponse["source"] | null>(null);
const publishedVersion = ref<string | null>(null);
const loadError = ref<string | null>(null);
const publishMessage = ref<string | null>(null);
const publishing = ref(false);
const showRaw = ref(false);

const canPublish = computed(() => validation.value?.ok === true && !publishing.value);

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

const groups = computed(() =>
  stagedCatalog.value ? groupProblemsByDomain(stagedCatalog.value) : [],
);

async function handlePublish() {
  publishing.value = true;
  publishMessage.value = null;
  try {
    const result = await publishStagedPesCatalog();
    if (result.ok) {
      publishedVersion.value = result.version.version;
      runtimeSource.value = "d1";
      publishMessage.value = `已寫入 D1，版本 ${result.version.version}`;
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
      檢查 <code>data/staged/pes-catalog.json</code> 是否可用。確認沒問題後再寫入 D1。
    </p>

    <p v-if="loadError" class="error">無法載入預覽：{{ loadError }}</p>

    <template v-else-if="stagedCatalog && validation">
      <section class="stat-grid">
        <article class="stat">
          <strong>{{ validation.stats.problems }}</strong>
          <span>問題</span>
        </article>
        <article class="stat">
          <strong>{{ validation.stats.etiologies }}</strong>
          <span>病因</span>
        </article>
        <article class="stat">
          <strong>{{ validation.stats.signs }}</strong>
          <span>徵象</span>
        </article>
        <article class="stat">
          <strong>{{ validation.ok ? "通過" : "未通過" }}</strong>
          <span>校驗</span>
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

      <section v-for="group in groups" :key="group.id" class="catalog-group">
        <h2>{{ group.label }}（{{ group.items.length }}）</h2>
        <ul class="problem-list">
          <li v-for="problem in group.items" :key="problem.id">
            <strong>{{ problem.code ? `${problem.code} ` : "" }}{{ problem.label }}</strong>
            <span class="muted">
              {{ problem.etiologies.length }} 個病因 ·
              {{ problem.etiologies.reduce((sum, item) => sum + item.signs.length, 0) }} 個徵象
            </span>
          </li>
        </ul>
      </section>

      <button type="button" class="primary-btn" :disabled="!canPublish" @click="handlePublish">
        {{ publishing ? "寫入中…" : "確認沒問題，寫入 D1" }}
      </button>
      <p v-if="publishMessage" class="publish-message">{{ publishMessage }}</p>

      <button type="button" class="text-btn" @click="showRaw = !showRaw">
        {{ showRaw ? "收合原始 JSON" : "查看原始 JSON" }}
      </button>
      <pre v-if="showRaw" class="raw-json">{{ JSON.stringify(stagedCatalog, null, 2) }}</pre>
    </template>
  </main>
</template>
