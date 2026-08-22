import type { PesCatalog, PesProblem } from "@shared/pes";

export function groupProblemsByDomain(catalog: PesCatalog) {
  const groups = new Map<string, PesProblem[]>();
  for (const problem of catalog.problems) {
    const items = groups.get(problem.domain) ?? [];
    items.push(problem);
    groups.set(problem.domain, items);
  }

  const orderedIds = [
    ...catalog.domains.map((domain) => domain.id).filter((id) => groups.has(id)),
    ...[...groups.keys()].filter((id) => !catalog.domains.some((domain) => domain.id === id)),
  ];

  return orderedIds.map((id) => ({
    id,
    label: catalog.domains.find((domain) => domain.id === id)?.label ?? id,
    items: groups.get(id) ?? [],
  }));
}
