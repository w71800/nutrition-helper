<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { countSigns, isProblemExtracted, signCategoryLabel } from "@shared/catalog";
import type {
  CatalogResponse,
  CatalogValidation,
  PesCatalog,
  PesProblem,
} from "@shared/pes";
import { fetchPesCatalog, fetchStagedPesCatalog, publishStagedPesCatalog } from "@/lib/api";
import { groupProblemsByDomain } from "@/lib/groupProblems";

const route = useRoute();
const router = useRouter();

const stagedCatalog = ref<PesCatalog | null>(null);
const validation = ref<CatalogValidation | null>(null);
const runtimeSource = ref<CatalogResponse["source"] | null>(null);
const publishedVersion = ref<string | null>(null);
const loadError = ref<string | null>(null);
const publishMessage = ref<string | null>(null);
const publishing = ref(false);
const selectedId = ref("");

const groups = computed(() =>
  stagedCatalog.value ? groupProblemsByDomain(stagedCatalog.value) : [],
);

const selectedProblem = computed<PesProblem | null>(() => {
  if (!stagedCatalog.value) return null;
  return (
    stagedCatalog.value.problems.find((problem) => problem.id === selectedId.value) ??
    null
  );
});

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

    const fromQuery = typeof route.query.id === "string" ? route.query.id : "";
    const extracted = staged.catalog.problems.find(isProblemExtracted);
    selectedId.value = fromQuery || extracted?.id || staged.catalog.problems[0]?.id || "";
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});

watch(selectedId, (id) => {
  if (!id) return;
  if (route.query.id === id) return;
  void router.replace({ query: { id } });
});

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
      目錄已建立全部 Domain／P。預覽與 JSON 只呈現目前這筆，方便核對抽取結果。
    </p>

    <p v-if="loadError" class="error">無法載入預覽：{{ loadError }}</p>

    <template v-else-if="stagedCatalog && validation">
      <section class="stat-grid">
        <article class="stat">
          <strong>{{ validation.stats.extracted }}</strong>
          <span>已抽取</span>
        </article>
        <article class="stat">
          <strong>{{ validation.stats.problems }}</strong>
          <span>問題總數</span>
        </article>
        <article class="stat">
          <strong>{{ selectedProblem ? selectedProblem.etiologies.length : "—" }}</strong>
          <span>此筆病因</span>
        </article>
        <article class="stat">
          <strong>{{ selectedProblem ? countSigns(selectedProblem) : "—" }}</strong>
          <span>此筆徵象</span>
        </article>
      </section>

      <p class="runtime-note">
        產生器目前讀取：
        <strong>{{ runtimeSource === "d1" ? "D1 已發布版" : "staged JSON（尚未入庫）" }}</strong>
        <span v-if="publishedVersion"> · {{ publishedVersion }}</span>
      </p>

      <label class="field">
        <span class="field-label">目前預覽的 P</span>
        <select v-model="selectedId">
          <optgroup
            v-for="group in groups"
            :key="group.id"
            :label="group.label"
          >
            <option v-for="item in group.items" :key="item.id" :value="item.id">
              {{ isProblemExtracted(item) ? "●" : "○" }}
              {{ item.label }}（p.{{ item.page }}）
            </option>
          </optgroup>
        </select>
      </label>

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

      <template v-if="selectedProblem">
        <section class="catalog-group">
          <p class="muted">
            {{ stagedCatalog.domains.find((d) => d.id === selectedProblem?.domain)?.label }}
            · p.{{ selectedProblem.page }}
            · {{ isProblemExtracted(selectedProblem) ? "已抽取" : "尚未抽取" }}
          </p>
          <h2>{{ selectedProblem.label }}</h2>
          <p v-if="selectedProblem.labelEn" class="muted">{{ selectedProblem.labelEn }}</p>
          <pre v-if="selectedProblem.definition" class="definition">{{ selectedProblem.definition }}</pre>
          <p v-else class="muted">尚無定義</p>
        </section>

        <section class="catalog-group">
          <h2>E（{{ selectedProblem.etiologies.length }}）</h2>
          <ol v-if="selectedProblem.etiologies.length" class="plain-list">
            <li v-for="item in selectedProblem.etiologies" :key="item.id">
              {{ item.label }}
              <span v-if="item.examples?.length" class="muted">
                （如：{{ item.examples.join("、") }}）
              </span>
            </li>
          </ol>
          <p v-else class="muted">尚未抽取病因</p>
        </section>

        <section
          v-for="category in selectedProblem.signs"
          :key="category.id"
          class="catalog-group"
        >
          <h2>{{ signCategoryLabel(category.id) }}</h2>
          <p v-if="!category.items.length" class="muted">無</p>
          <ul v-else class="plain-list">
            <li v-for="item in category.items" :key="item.id">
              <strong>{{ item.label }}</strong>
              <ul v-if="item.details?.length" class="detail-list">
                <li v-for="detail in item.details" :key="detail">{{ detail }}</li>
              </ul>
            </li>
          </ul>
        </section>

        <h2 class="json-heading">此筆 JSON</h2>
        <pre class="raw-json">{{ JSON.stringify(selectedProblem, null, 2) }}</pre>
      </template>

      <button type="button" class="primary-btn" :disabled="!canPublish" @click="handlePublish">
        {{ publishing ? "寫入中…" : "確認沒問題，寫入 D1" }}
      </button>
      <p v-if="publishMessage" class="publish-message">{{ publishMessage }}</p>
    </template>
  </main>
</template>
