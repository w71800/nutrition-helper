<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { signCategoryLabel } from "@shared/catalog";
import type { CatalogResponse, PesCatalog } from "@shared/pes";
import { usePesCascade } from "@/composables/usePesCascade";
import { fetchPesCatalog } from "@/lib/api";
import { formatPesForClipboard } from "@/lib/formatPes";
import { groupProblemsByDomain } from "@/lib/groupProblems";

const catalog = ref<PesCatalog | null>(null);
const source = ref<CatalogResponse["source"] | null>(null);
const versionLabel = ref<string | null>(null);
const loadError = ref<string | null>(null);
const copied = ref(false);

const {
  problemId,
  etiologyId,
  signId,
  problem,
  hasEtiologies,
  etiologyMissing,
  onProblemChange,
  ready,
  labels,
} = usePesCascade(catalog);

const problemsByDomain = computed(() =>
  catalog.value ? groupProblemsByDomain(catalog.value) : [],
);

const previewText = computed(() =>
  labels.value
    ? formatPesForClipboard(
        labels.value.p,
        labels.value.e,
        labels.value.s,
        labels.value.details,
      )
    : "",
);

onMounted(async () => {
  try {
    const response = await fetchPesCatalog();
    catalog.value = response.catalog;
    source.value = response.source;
    versionLabel.value = response.version?.version ?? null;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});

async function handleCopy() {
  if (!previewText.value) return;
  await navigator.clipboard.writeText(previewText.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <main class="page page-narrow">
    <p v-if="loadError" class="error">無法載入 PES 資料：{{ loadError }}</p>
    <p v-else-if="!catalog">載入中…</p>

    <template v-else>
      <p class="eyebrow">工具</p>
      <h1>PES 診斷文本</h1>
      <p class="lede">
        選擇 P 與 S；有病因時需再選 E，完成後可一鍵複製
        <span class="meta-inline">
          · 資料來源 {{ source === "d1" ? "D1 已發布版" : "staged JSON" }}
        </span>
        <span v-if="versionLabel" class="meta-inline">· {{ versionLabel }}</span>
      </p>

      <label class="field">
        <span class="field-label">P（問題）</span>
        <select :value="problemId" @change="onProblemChange(($event.target as HTMLSelectElement).value)">
          <option value="">請選擇</option>
          <optgroup
            v-for="group in problemsByDomain"
            :key="group.id"
            :label="group.label"
          >
            <option v-for="item in group.items" :key="item.id" :value="item.id">
              {{ item.label }}（p.{{ item.page }}）
            </option>
          </optgroup>
        </select>
      </label>

      <label class="field">
        <span class="field-label">E（病因）</span>
        <select
          :value="problem && !hasEtiologies ? 'none' : etiologyId"
          :disabled="!problem || !hasEtiologies"
          @change="etiologyId = ($event.target as HTMLSelectElement).value"
        >
          <option v-if="!problem || hasEtiologies" value="">請選擇</option>
          <option v-else value="none">無</option>
          <option
            v-for="item in problem?.etiologies ?? []"
            :key="item.id"
            :value="item.id"
          >
            {{ item.label }}
          </option>
        </select>
        <span v-if="etiologyMissing" class="field-hint">請選擇病因</span>
      </label>

      <label class="field">
        <span class="field-label">S（徵象）</span>
        <select
          :value="signId"
          :disabled="!problem"
          @change="signId = ($event.target as HTMLSelectElement).value"
        >
          <option value="">請選擇</option>
          <template v-for="category in problem?.signs ?? []" :key="category.id">
            <optgroup
              v-if="category.items.length"
              :label="signCategoryLabel(category.id)"
            >
              <option
                v-for="item in category.items"
                :key="item.id"
                :value="item.id"
              >
                {{ item.label }}
              </option>
            </optgroup>
          </template>
        </select>
      </label>

      <section v-if="labels" class="preview" aria-live="polite">
        <h2 class="preview-title">預覽</h2>
        <pre>{{ previewText }}</pre>
      </section>

      <button type="button" class="primary-btn" :disabled="!ready" @click="handleCopy">
        {{ copied ? "已複製" : "一鍵複製" }}
      </button>

      <p v-if="catalog.meta?.disclaimer" class="disclaimer">
        {{ catalog.meta.disclaimer }}
      </p>
    </template>
  </main>
</template>
