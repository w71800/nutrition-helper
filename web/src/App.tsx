import { useEffect, useMemo, useState } from "react";
import type { PesCatalog, PesProblem } from "./types/pes";
import { usePesCascade } from "./hooks/usePesCascade";
import { formatPesForClipboard } from "./utils/formatPes";
import "./App.css";

export default function App() {
  const [catalog, setCatalog] = useState<PesCatalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    problemId,
    etiologyId,
    signId,
    problem,
    etiology,
    onProblemChange,
    onEtiologyChange,
    setSignId,
    ready,
    labels,
  } = usePesCascade(catalog);

  const problemsByDomain = useMemo(() => {
    if (!catalog) return [] as { domain: string; items: PesProblem[] }[];
    const order = ["NI", "NC", "NB"];
    const groups = new Map<string, PesProblem[]>();
    for (const p of catalog.problems) {
      const d = p.domain ?? "OTHER";
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d)!.push(p);
    }
    return order
      .filter((d) => groups.has(d))
      .map((d) => ({
        domain:
          catalog.domains?.find((x) => x.id === d)?.label ??
          catalog.problems.find((p) => p.domain === d)?.domainLabel ??
          d,
        items: groups.get(d)!,
      }));
  }, [catalog]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/pes-catalog.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PesCatalog>;
      })
      .then(setCatalog)
      .catch((e) => setLoadError(String(e)));
  }, []);

  const handleCopy = async () => {
    if (!labels) return;
    const text = formatPesForClipboard(labels.p, labels.e, labels.s);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadError) {
    return (
      <main className="pes-app">
        <p className="error">無法載入 PES 資料：{loadError}</p>
      </main>
    );
  }

  if (!catalog) {
    return (
      <main className="pes-app">
        <p>載入中…</p>
      </main>
    );
  }

  return (
    <main className="pes-app">
      <h1>PES 診斷選擇</h1>
      <p className="subtitle">
        依序選擇 P → E → S，完成後可一鍵複製
        {catalog.meta?.edition && (
          <span className="edition"> · NCPT {catalog.meta.edition}</span>
        )}
      </p>

      <label className="field">
        <span className="field-label">P（問題）</span>
        <select
          value={problemId}
          onChange={(e) => onProblemChange(e.target.value)}
        >
          <option value="">請選擇</option>
          {problemsByDomain.map((group) => (
            <optgroup key={group.domain} label={group.domain}>
              {group.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} ` : ""}
                  {p.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">E（病因）</span>
        <select
          value={etiologyId}
          disabled={!problem}
          onChange={(e) => onEtiologyChange(e.target.value)}
        >
          <option value="">請選擇</option>
          {problem?.etiologies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">S（徵象）</span>
        <select
          value={signId}
          disabled={!etiology}
          onChange={(e) => setSignId(e.target.value)}
        >
          <option value="">請選擇</option>
          {etiology?.signs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {labels && (
        <section className="preview" aria-live="polite">
          <h2 className="preview-title">預覽</h2>
          <pre>{formatPesForClipboard(labels.p, labels.e, labels.s)}</pre>
        </section>
      )}

      <button type="button" className="copy-btn" disabled={!ready} onClick={handleCopy}>
        {copied ? "已複製" : "一鍵複製"}
      </button>

      {catalog.meta?.disclaimer && (
        <p className="disclaimer">{catalog.meta.disclaimer}</p>
      )}
    </main>
  );
}
