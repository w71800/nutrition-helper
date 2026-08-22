import type { PesCatalog, PesProblem } from "@shared/pes";

const DOMAIN_ORDER = ["NI", "NC", "NB"];

export function groupProblemsByDomain(catalog: PesCatalog) {
  const groups = new Map<string, PesProblem[]>();
  for (const problem of catalog.problems) {
    const domain = problem.domain ?? "OTHER";
    const items = groups.get(domain) ?? [];
    items.push(problem);
    groups.set(domain, items);
  }

  const orderedIds = [
    ...DOMAIN_ORDER.filter((id) => groups.has(id)),
    ...[...groups.keys()].filter((id) => !DOMAIN_ORDER.includes(id)),
  ];

  return orderedIds.map((id) => ({
    id,
    label:
      catalog.domains?.find((domain) => domain.id === id)?.label ??
      catalog.problems.find((problem) => problem.domain === id)?.domainLabel ??
      id,
    items: groups.get(id) ?? [],
  }));
}
