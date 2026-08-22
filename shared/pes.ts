export type PesSign = {
  id: string;
  label: string;
  labelEn?: string;
};

export type PesEtiology = {
  id: string;
  label: string;
  labelEn?: string;
  signs: PesSign[];
};

export type PesProblem = {
  id: string;
  code?: string;
  domain?: string;
  domainLabel?: string;
  label: string;
  labelEn?: string;
  definition?: string;
  etiologies: PesEtiology[];
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
  domains?: PesDomain[];
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
