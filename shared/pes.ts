export const SIGN_CATEGORIES = [
  { id: "biochemical", label: "生化檢驗資料、醫療檢驗及步驟" },
  { id: "anthropometric", label: "體位測量" },
  { id: "nfpe", label: "營養相關理學檢查發現" },
  { id: "food_nutrition_history", label: "飲食／營養紀錄" },
  { id: "client_history", label: "個案史" },
] as const;

export type SignCategoryId = (typeof SIGN_CATEGORIES)[number]["id"];

export type PesSign = {
  id: string;
  label: string;
  details?: string[];
};

export type PesSignCategory = {
  id: SignCategoryId;
  items: PesSign[];
};

export type PesEtiology = {
  id: string;
  label: string;
  examples?: string[];
};

export type PesProblem = {
  id: string;
  label: string;
  labelEn?: string;
  definition?: string;
  page: number;
  domain: string;
  etiologies: PesEtiology[];
  signs: PesSignCategory[];
};

export type PesDomain = {
  id: string;
  label: string;
  labelEn?: string;
};

export type PesCatalogMeta = {
  edition?: string;
  terminology?: string;
  publishedBy?: string;
  lastUpdated?: string;
  sources?: string[];
  disclaimer?: string;
  pesFormat?: string;
};

export type PesCatalog = {
  meta?: PesCatalogMeta;
  domains: PesDomain[];
  problems: PesProblem[];
};

export type CatalogSource = "d1" | "staged";

export type CatalogVersionMeta = {
  id: number;
  version: string;
  sourceHash: string;
  publishedAt: string | null;
};

export type ValidationIssue = {
  level: "error" | "warning";
  path: string;
  message: string;
};

export type CatalogStats = {
  domains: number;
  problems: number;
  extracted: number;
  etiologies: number;
  signs: number;
};

export type CatalogValidation = {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: CatalogStats;
};

export type CatalogResponse = {
  source: CatalogSource;
  catalog: PesCatalog;
  version?: CatalogVersionMeta;
};

export type StagedCatalogResponse = {
  catalog: PesCatalog;
  validation: CatalogValidation;
};

export type PublishResponse =
  | { ok: true; version: CatalogVersionMeta }
  | { ok: false; message: string; validation?: CatalogValidation };
