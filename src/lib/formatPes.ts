export const ABSENT_ETIOLOGY_LABEL = "無";

export function formatPesForClipboard(
  p: string,
  e: string,
  s: string,
  details?: string[],
): string {
  const etiology = e.trim() ? e : ABSENT_ETIOLOGY_LABEL;
  const lines = [`P：${p}`, `E：${etiology}`, `S：${s}`];
  for (const detail of details ?? []) {
    lines.push(`　${detail}`);
  }
  return lines.join("\n");
}
