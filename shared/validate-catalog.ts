import {
  SIGN_CATEGORIES,
  type CatalogStats,
  type CatalogValidation,
  type PesCatalog,
  type ValidationIssue,
} from "./pes";

const REQUIRED_SIGN_IDS = SIGN_CATEGORIES.map((category) => category.id);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function validatePesCatalog(input: unknown): CatalogValidation {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const stats: CatalogStats = {
    domains: 0,
    problems: 0,
    extracted: 0,
    etiologies: 0,
    signs: 0,
  };

  if (!isRecord(input)) {
    errors.push({ level: "error", path: "$", message: "根物件必須是 JSON object" });
    return { ok: false, errors, warnings, stats };
  }

  const domainIds = new Set<string>();
  if (!Array.isArray(input.domains)) {
    errors.push({ level: "error", path: "domains", message: "domains 必須是陣列" });
  } else {
    stats.domains = input.domains.length;
    input.domains.forEach((domain, index) => {
      const path = `domains[${index}]`;
      if (!isRecord(domain)) {
        errors.push({ level: "error", path, message: "domain 必須是物件" });
        return;
      }
      const id = asString(domain.id);
      const label = asString(domain.label);
      if (!id) errors.push({ level: "error", path: `${path}.id`, message: "缺少 id" });
      else if (domainIds.has(id)) {
        errors.push({ level: "error", path: `${path}.id`, message: `重複的 domain id：${id}` });
      } else domainIds.add(id);
      if (!label) errors.push({ level: "error", path: `${path}.label`, message: "缺少 label" });
    });
  }

  if (!Array.isArray(input.problems)) {
    errors.push({ level: "error", path: "problems", message: "problems 必須是陣列" });
    return { ok: errors.length === 0, errors, warnings, stats };
  }

  stats.problems = input.problems.length;

  const problemIds = new Set<string>();
  input.problems.forEach((problem, pIndex) => {
    const pPath = `problems[${pIndex}]`;
    if (!isRecord(problem)) {
      errors.push({ level: "error", path: pPath, message: "problem 必須是物件" });
      return;
    }

    const problemId = asString(problem.id);
    const label = asString(problem.label);
    if (!problemId) errors.push({ level: "error", path: `${pPath}.id`, message: "缺少 id" });
    else if (problemIds.has(problemId)) {
      errors.push({ level: "error", path: `${pPath}.id`, message: `重複的 problem id：${problemId}` });
    } else problemIds.add(problemId);
    if (!label) errors.push({ level: "error", path: `${pPath}.label`, message: "缺少 label" });

    if (typeof problem.page !== "number" || !Number.isInteger(problem.page) || problem.page <= 0) {
      errors.push({ level: "error", path: `${pPath}.page`, message: "page 必須是正整數" });
    }

    const domain = asString(problem.domain);
    if (!domain) errors.push({ level: "error", path: `${pPath}.domain`, message: "缺少 domain" });
    else if (domainIds.size > 0 && !domainIds.has(domain)) {
      errors.push({ level: "error", path: `${pPath}.domain`, message: `未知的 domain：${domain}` });
    }

    if (!Array.isArray(problem.etiologies)) {
      errors.push({ level: "error", path: `${pPath}.etiologies`, message: "etiologies 必須是陣列" });
      return;
    }

    const etiologyIds = new Set<string>();
    problem.etiologies.forEach((etiology, eIndex) => {
      const ePath = `${pPath}.etiologies[${eIndex}]`;
      if (!isRecord(etiology)) {
        errors.push({ level: "error", path: ePath, message: "etiology 必須是物件" });
        return;
      }
      stats.etiologies += 1;
      const etiologyId = asString(etiology.id);
      const eLabel = asString(etiology.label);
      if (!etiologyId) errors.push({ level: "error", path: `${ePath}.id`, message: "缺少 id" });
      else if (etiologyIds.has(etiologyId)) {
        errors.push({ level: "error", path: `${ePath}.id`, message: `同一 problem 內重複的 etiology id：${etiologyId}` });
      } else etiologyIds.add(etiologyId);
      if (!eLabel) errors.push({ level: "error", path: `${ePath}.label`, message: "缺少 label" });
      if (etiology.examples !== undefined && !isStringArray(etiology.examples)) {
        errors.push({ level: "error", path: `${ePath}.examples`, message: "examples 必須是字串陣列" });
      }
    });

    if (!Array.isArray(problem.signs)) {
      errors.push({ level: "error", path: `${pPath}.signs`, message: "signs 必須是長度 5 的陣列" });
      return;
    }

    const categoryIds = problem.signs.map((category) =>
      isRecord(category) ? asString(category.id) : undefined,
    );
    if (
      problem.signs.length !== REQUIRED_SIGN_IDS.length ||
      REQUIRED_SIGN_IDS.some((id, index) => categoryIds[index] !== id)
    ) {
      errors.push({
        level: "error",
        path: `${pPath}.signs`,
        message: `signs 必須依序為 ${REQUIRED_SIGN_IDS.join("、")}`,
      });
    }

    problem.signs.forEach((category, cIndex) => {
      const cPath = `${pPath}.signs[${cIndex}]`;
      if (!isRecord(category)) {
        errors.push({ level: "error", path: cPath, message: "sign category 必須是物件" });
        return;
      }
      if (!Array.isArray(category.items)) {
        errors.push({ level: "error", path: `${cPath}.items`, message: "items 必須是陣列" });
        return;
      }

      const signIds = new Set<string>();
      category.items.forEach((sign, sIndex) => {
        const sPath = `${cPath}.items[${sIndex}]`;
        if (!isRecord(sign)) {
          errors.push({ level: "error", path: sPath, message: "sign 必須是物件" });
          return;
        }
        stats.signs += 1;
        const signId = asString(sign.id);
        const sLabel = asString(sign.label);
        if (!signId) errors.push({ level: "error", path: `${sPath}.id`, message: "缺少 id" });
        else if (signIds.has(signId)) {
          errors.push({ level: "error", path: `${sPath}.id`, message: `同一分類內重複的 sign id：${signId}` });
        } else signIds.add(signId);
        if (!sLabel) errors.push({ level: "error", path: `${sPath}.label`, message: "缺少 label" });
        if (sign.details !== undefined && !isStringArray(sign.details)) {
          errors.push({ level: "error", path: `${sPath}.details`, message: "details 必須是字串陣列" });
        }
      });
    });

    const hasDefinition = Boolean(asString(problem.definition));
    const hasSigns = problem.signs.some(
      (category) => isRecord(category) && Array.isArray(category.items) && category.items.length > 0,
    );
    if (hasDefinition || problem.etiologies.length > 0 || hasSigns) {
      stats.extracted += 1;
    }
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function asPesCatalog(input: unknown): PesCatalog {
  const result = validatePesCatalog(input);
  if (!result.ok) {
    throw new Error(result.errors.map((issue) => issue.message).join("; "));
  }
  return input as PesCatalog;
}
