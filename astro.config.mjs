import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://go.aiixi.cc",
  integrations: [sitemap({ lastmod: new Date() })],
  output: "static",
  outDir: "./dist",
  publicDir: "./static",
  compressHTML: false,
});
