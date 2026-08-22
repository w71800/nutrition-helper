import type {
  CatalogStats,
  CatalogValidation,
  PesCatalog,
  ValidationIssue,
} from "./pes";

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
    etiologies: 0,
    signs: 0,
  };

  if (!isRecord(input)) {
    errors.push({ level: "error", path: "$", message: "根物件必須是 JSON object" });
    return { ok: false, errors, warnings, stats };
  }

  if (input.domains !== undefined) {
    if (!Array.isArray(input.domains)) {
      errors.push({ level: "error", path: "domains", message: "domains 必須是陣列" });
    } else {
      stats.domains = input.domains.length;
      const domainIds = new Set<string>();
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
  }

  if (!Array.isArray(input.problems)) {
    errors.push({ level: "error", path: "problems", message: "problems 必須是陣列" });
    return { ok: errors.length === 0, errors, warnings, stats };
  }

  stats.problems = input.problems.length;
  if (input.problems.length === 0) {
    errors.push({ level: "error", path: "problems", message: "至少需要一筆 problem" });
  }

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

    if (!Array.isArray(problem.etiologies)) {
      errors.push({ level: "error", path: `${pPath}.etiologies`, message: "etiologies 必須是陣列" });
      return;
    }
    if (problem.etiologies.length === 0) {
      warnings.push({
        level: "warning",
        path: `${pPath}.etiologies`,
        message: `${label ?? problemId ?? pPath} 沒有病因`,
      });
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

      if (!Array.isArray(etiology.signs)) {
        errors.push({ level: "error", path: `${ePath}.signs`, message: "signs 必須是陣列" });
        return;
      }
      if (etiology.signs.length === 0) {
        warnings.push({
          level: "warning",
          path: `${ePath}.signs`,
          message: `${eLabel ?? etiologyId ?? ePath} 沒有徵象`,
        });
      }

      const signIds = new Set<string>();
      etiology.signs.forEach((sign, sIndex) => {
        const sPath = `${ePath}.signs[${sIndex}]`;
        if (!isRecord(sign)) {
          errors.push({ level: "error", path: sPath, message: "sign 必須是物件" });
          return;
        }
        stats.signs += 1;
        const signId = asString(sign.id);
        const sLabel = asString(sign.label);
        if (!signId) errors.push({ level: "error", path: `${sPath}.id`, message: "缺少 id" });
        else if (signIds.has(signId)) {
          errors.push({ level: "error", path: `${sPath}.id`, message: `同一 etiology 內重複的 sign id：${signId}` });
        } else signIds.add(signId);
        if (!sLabel) errors.push({ level: "error", path: `${sPath}.label`, message: "缺少 label" });
      });
    });
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

export function asPesCatalog(input: unknown): PesCatalog {
  const result = validatePesCatalog(input);
  if (!result.ok) {
    throw new Error(result.errors.map((issue) => issue.message).join("; "));
  }
  return input as PesCatalog;
}
