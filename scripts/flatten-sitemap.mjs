import { readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const outputPath = (filename) => join(outputDirectory, filename);
const files = await readdir(outputDirectory);
const sitemapFiles = files.filter((file) => /^sitemap-\d+\.xml$/.test(file));

if (sitemapFiles.length !== 1 || !files.includes("sitemap-index.xml")) {
  throw new Error(
    `Expected one sitemap shard and an index, found ${sitemapFiles.length} shard(s).`,
  );
}

await rename(outputPath(sitemapFiles[0]), outputPath("sitemap.xml"));
await rm(outputPath("sitemap-index.xml"));
