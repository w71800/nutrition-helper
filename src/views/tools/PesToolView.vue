<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { signCategoryLabel } from "@shared/catalog";
import type { CatalogResponse, PesCatalog } from "@shared/pes";
import AppSelect, {
  type AppSelectGroup,
  type AppSelectOption,
} from "@/components/AppSelect.vue";
import { usePesCascade } from "@/composables/usePesCascade";
import { fetchPesCatalog } from "@/lib/api";
import { formatPesForClipboard } from "@/lib/formatPes";
import { groupProblemsByDomain } from "@/lib/groupProblems";

const catalog = ref<PesCatalog | null>(null);
const source = ref<CatalogResponse["source"] | null>(null);
const versionLabel = ref<string | null>(null);
const loadError = ref<string | null>(null);
const copied = ref(false);
let copiedTimer = 0;

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

const problemGroups = computed<AppSelectGroup[]>(() =>
  problemsByDomain.value.map((group) => ({
    id: group.id,
    label: group.label,
    options: group.items.map((item) => ({
      value: item.id,
      label: `${item.label}（p.${item.page}）`,
    })),
  })),
);

const etiologyOptions = computed<AppSelectOption[]>(() => {
  if (!problem.value) return [];
  if (!hasEtiologies.value) return [{ value: "none", label: "無" }];
  return problem.value.etiologies.map((item) => ({
    value: item.id,
    label: item.label,
  }));
});

const etiologyValue = computed(() =>
  problem.value && !hasEtiologies.value ? "none" : etiologyId.value,
);

const signGroups = computed<AppSelectGroup[]>(() =>
  (problem.value?.signs ?? [])
    .filter((category) => category.items.length)
    .map((category) => ({
      id: category.id,
      label: signCategoryLabel(category.id),
      options: category.items.map((item) => ({
        value: item.id,
        label: item.label,
      })),
    })),
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
  window.clearTimeout(copiedTimer);
  copiedTimer = window.setTimeout(() => {
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

      <div class="field">
        <label class="field-label" for="pes-problem">P（問題）</label>
        <AppSelect
          id="pes-problem"
          :model-value="problemId"
          :groups="problemGroups"
          @update:model-value="onProblemChange"
        />
      </div>

      <div class="field">
        <label class="field-label" for="pes-etiology">E（病因）</label>
        <AppSelect
          id="pes-etiology"
          :model-value="etiologyValue"
          :options="etiologyOptions"
          :disabled="!problem || !hasEtiologies"
          @update:model-value="etiologyId = $event"
        />
        <span v-if="etiologyMissing" class="field-hint">請選擇病因</span>
      </div>

      <div class="field">
        <label class="field-label" for="pes-sign">S（徵象）</label>
        <AppSelect
          id="pes-sign"
          v-model="signId"
          :groups="signGroups"
          :disabled="!problem"
        />
      </div>

      <section v-if="labels" class="preview" aria-live="polite">
        <h2 class="preview-title">預覽</h2>
        <pre>{{ previewText }}</pre>
      </section>

      <button
        type="button"
        class="primary-btn copy-btn"
        :data-copied="copied ? 'true' : undefined"
        :disabled="!ready"
        @click="handleCopy"
      >
        <span class="copy-btn-face">
          <svg
            v-if="copied"
            class="copy-btn-check"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{{ copied ? "已複製" : "一鍵複製" }}</span>
        </span>
      </button>

      <p v-if="catalog.meta?.disclaimer" class="disclaimer">
        {{ catalog.meta.disclaimer }}
      </p>
    </template>
  </main>
</template>
