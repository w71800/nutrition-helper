export type PesSign = { id: string; label: string; labelEn?: string };
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
export type PesCatalogMeta = {
  edition: string;
  terminology: string;
  disclaimer?: string;
  pesFormat?: string;
};
export type PesCatalog = {
  meta?: PesCatalogMeta;
  domains?: { id: string; label: string; labelEn?: string }[];
  problems: PesProblem[];
};
