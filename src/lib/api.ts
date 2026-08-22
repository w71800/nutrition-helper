import type {
  CatalogResponse,
  PublishResponse,
  StagedCatalogResponse,
} from "@shared/pes";

async function readJson<T>(request: Promise<Response>): Promise<T> {
  const response = await request;
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      // keep status text
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export function fetchPesCatalog() {
  return readJson<CatalogResponse>(fetch("/api/pes/catalog"));
}

export function fetchStagedPesCatalog() {
  return readJson<StagedCatalogResponse>(fetch("/api/internal/pes/staged"));
}

export function publishStagedPesCatalog() {
  return readJson<PublishResponse>(
    fetch("/api/internal/pes/publish", { method: "POST" }),
  );
}
