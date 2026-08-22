import { computed, ref, watch, type Ref } from "vue";
import { flattenSigns } from "@shared/catalog";
import type { PesCatalog } from "@shared/pes";

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

  const onProblemChange = (id: string) => {
    problemId.value = id;
    etiologyId.value = "";
    signId.value = "";
  };

  const ready = computed(() => Boolean(problem.value && etiology.value && sign.value));

  const labels = computed(() =>
    ready.value
      ? {
          p: problem.value!.label,
          e: etiology.value!.label,
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
    onProblemChange,
    ready,
    labels,
  };
}
