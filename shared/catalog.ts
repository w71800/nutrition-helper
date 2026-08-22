import {
  SIGN_CATEGORIES,
  type PesCatalog,
  type PesProblem,
  type PesSign,
  type PesSignCategory,
} from "./pes";

export function emptySignCategories(): PesSignCategory[] {
  return SIGN_CATEGORIES.map((category) => ({ id: category.id, items: [] }));
}

export function signCategoryLabel(id: PesSignCategory["id"]) {
  return SIGN_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function flattenSigns(problem: PesProblem): PesSign[] {
  return problem.signs.flatMap((category) => category.items);
}

export function isProblemExtracted(problem: PesProblem) {
  return Boolean(
    problem.definition ||
      problem.etiologies.length > 0 ||
      flattenSigns(problem).length > 0,
  );
}

export function countSigns(problem: PesProblem) {
  return flattenSigns(problem).length;
}

export function emptyStagedCatalog(catalog: PesCatalog): PesCatalog {
  return { ...catalog, problems: [] };
}

export function mergePesCatalog(published: PesCatalog | null, staged: PesCatalog): PesCatalog {
  const domainMap = new Map((published?.domains ?? []).map((domain) => [domain.id, domain]));
  for (const domain of staged.domains) {
    domainMap.set(domain.id, domain);
  }

  const problemMap = new Map((published?.problems ?? []).map((problem) => [problem.id, problem]));
  for (const problem of staged.problems) {
    problemMap.set(problem.id, problem);
  }

  const domains = [...domainMap.values()];
  const domainOrder = new Map(domains.map((domain, index) => [domain.id, index]));
  const problems = [...problemMap.values()].sort((a, b) => {
    const domainA = domainOrder.get(a.domain) ?? Number.MAX_SAFE_INTEGER;
    const domainB = domainOrder.get(b.domain) ?? Number.MAX_SAFE_INTEGER;
    if (domainA !== domainB) return domainA - domainB;
    if (a.page !== b.page) return a.page - b.page;
    return a.label.localeCompare(b.label, "zh-Hant");
  });

  return {
    meta: { ...published?.meta, ...staged.meta },
    domains,
    problems,
  };
}
