import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import stagedCatalog from "../data/staged/pes-catalog.json";
import type { PublishResponse } from "@shared/pes";
import { validatePesCatalog } from "@shared/validate-catalog";
import { getPublishedCatalog, publishCatalog } from "./catalog";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/pes/catalog", async (c) => {
  const published = await getPublishedCatalog(c.env.DB);
  if (published) {
    return c.json({
      source: "d1",
      version: published.meta,
      catalog: published.catalog,
    });
  }

  return c.json({
    source: "staged",
    catalog: stagedCatalog,
  });
});

app.get("/api/internal/pes/staged", (c) => {
  const validation = validatePesCatalog(stagedCatalog);
  return c.json({
    catalog: stagedCatalog,
    validation,
  });
});

app.post("/api/internal/pes/publish", async (c) => {
  const validation = validatePesCatalog(stagedCatalog);
  if (!validation.ok) {
    const body: PublishResponse = {
      ok: false,
      message: "staged 資料未通過校驗，無法寫入",
      validation,
    };
    return c.json(body, 400);
  }

  try {
    const version = await publishCatalog(c.env.DB, stagedCatalog);
    const body: PublishResponse = { ok: true, version };
    return c.json(body);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "寫入 D1 失敗。請先執行 npm run db:migrate:local";
    throw new HTTPException(503, { message });
  }
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ ok: false, message: error.message }, error.status);
  }
  return c.json({ ok: false, message: "伺服器錯誤" }, 500);
});

export default app;
