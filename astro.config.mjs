import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://go.aiixi.cc",
  integrations: [react(), sitemap({ lastmod: new Date() })],
  output: "static",
  outDir: "./dist",
  publicDir: "./static",
  compressHTML: false,
});
