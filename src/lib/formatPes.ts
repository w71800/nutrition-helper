export function formatPesForClipboard(
  p: string,
  e: string,
  s: string,
  details?: string[],
): string {
  const lines = [`P：${p}`, `E：${e}`, `S：${s}`];
  for (const detail of details ?? []) {
    lines.push(`　${detail}`);
  }
  return lines.join("\n");
}
