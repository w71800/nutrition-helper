import { computed, ref, watch, type Ref } from "vue";
import { flattenSigns } from "@shared/catalog";
import type { PesCatalog } from "@shared/pes";
import { ABSENT_ETIOLOGY_LABEL } from "@/lib/formatPes";

export function usePesCascade(catalog: Ref<PesCatalog | null>) {
  const problemId = ref("");
  const etiologyId = ref("");
  const signId = ref("");

  const problem = computed(() =>
    catalog.value?.problems.find((item) => item.id === problemId.value),
  );
  const etiology = computed(() =>
    problem.value?.etiologies.find((item) => item.id === etiologyId.value),
  );
  const sign = computed(() =>
    problem.value ? flattenSigns(problem.value).find((item) => item.id === signId.value) : undefined,
  );
  const hasEtiologies = computed(() => (problem.value?.etiologies.length ?? 0) > 0);
  const etiologyMissing = computed(
    () => Boolean(problem.value) && hasEtiologies.value && !etiology.value,
  );

  const onProblemChange = (id: string) => {
    problemId.value = id;
    etiologyId.value = "";
    signId.value = "";
  };

  const ready = computed(
    () => Boolean(problem.value && sign.value) && !etiologyMissing.value,
  );

  const labels = computed(() =>
    ready.value
      ? {
          p: problem.value!.label,
          e: etiology.value?.label ?? ABSENT_ETIOLOGY_LABEL,
          s: sign.value!.label,
          details: sign.value!.details,
        }
      : null,
  );

  watch(catalog, () => {
    problemId.value = "";
    etiologyId.value = "";
    signId.value = "";
  });

  return {
    problemId,
    etiologyId,
    signId,
    problem,
    etiology,
    sign,
    hasEtiologies,
    etiologyMissing,
    onProblemChange,
    ready,
    labels,
  };
}
