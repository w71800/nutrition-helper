import {
  SIGN_CATEGORIES,
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
