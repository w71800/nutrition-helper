import { useMemo, useState } from "react";
import type { PesCatalog } from "../types/pes";

export function usePesCascade(catalog: PesCatalog | null) {
  const [problemId, setProblemId] = useState("");
  const [etiologyId, setEtiologyId] = useState("");
  const [signId, setSignId] = useState("");

  const problem = useMemo(
    () => catalog?.problems.find((x) => x.id === problemId),
    [catalog, problemId],
  );
  const etiology = useMemo(
    () => problem?.etiologies.find((x) => x.id === etiologyId),
    [problem, etiologyId],
  );
  const sign = useMemo(
    () => etiology?.signs.find((x) => x.id === signId),
    [etiology, signId],
  );

  const onProblemChange = (id: string) => {
    setProblemId(id);
    setEtiologyId("");
    setSignId("");
  };

  const onEtiologyChange = (id: string) => {
    setEtiologyId(id);
    setSignId("");
  };

  const ready = Boolean(problem && etiology && sign);

  return {
    problemId,
    etiologyId,
    signId,
    problem,
    etiology,
    sign,
    onProblemChange,
    onEtiologyChange,
    setSignId,
    ready,
    labels: ready
      ? { p: problem!.label, e: etiology!.label, s: sign!.label }
      : null,
  };
}
