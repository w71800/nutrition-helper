<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { usePesCascade } from "@/composables/usePesCascade";
import { fetchPesCatalog } from "@/lib/api";
import { formatPesForClipboard } from "@/lib/formatPes";
import { groupProblemsByDomain } from "@/lib/groupProblems";
import type { CatalogResponse, PesCatalog } from "@shared/pes";

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
  etiology,
  onProblemChange,
  onEtiologyChange,
  ready,
  labels,
} = usePesCascade(catalog);

const problemsByDomain = computed(() =>
  catalog.value ? groupProblemsByDomain(catalog.value) : [],
);

const previewText = computed(() =>
  labels.value
    ? formatPesForClipboard(labels.value.p, labels.value.e, labels.value.s)
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
        依序選擇 P → E → S，完成後可一鍵複製
        <span v-if="catalog.meta?.edition" class="meta-inline">
          · NCPT {{ catalog.meta.edition }}
        </span>
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
              {{ item.code ? `${item.code} ` : "" }}{{ item.label }}
            </option>
          </optgroup>
        </select>
      </label>

      <label class="field">
        <span class="field-label">E（病因）</span>
        <select
          :value="etiologyId"
          :disabled="!problem"
          @change="onEtiologyChange(($event.target as HTMLSelectElement).value)"
        >
          <option value="">請選擇</option>
          <option
            v-for="item in problem?.etiologies ?? []"
            :key="item.id"
            :value="item.id"
          >
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="field-label">S（徵象）</span>
        <select
          :value="signId"
          :disabled="!etiology"
          @change="signId = ($event.target as HTMLSelectElement).value"
        >
          <option value="">請選擇</option>
          <option
            v-for="item in etiology?.signs ?? []"
            :key="item.id"
            :value="item.id"
          >
            {{ item.label }}
          </option>
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
