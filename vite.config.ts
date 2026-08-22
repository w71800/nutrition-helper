import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { cloudflare } from "@cloudflare/vite-plugin";

function stagedCatalogPath() {
  return fileURLToPath(new URL("./data/staged/pes-catalog.json", import.meta.url));
}

function clearStagedPlugin(): Plugin {
  return {
    name: "clear-staged-catalog",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || req.url?.split("?")[0] !== "/__dev/clear-staged") {
          next();
          return;
        }

        const path = stagedCatalogPath();
        const catalog = JSON.parse(readFileSync(path, "utf8")) as { problems?: unknown[] };
        catalog.problems = [];
        writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`);
        res.statusCode = 204;
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [clearStagedPlugin(), vue(), cloudflare()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
});
