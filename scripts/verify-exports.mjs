// scripts/verify-exports.mjs
//
// Walks every path referenced in package.json#exports (and #main/#module/#types)
// and fails the build if any of them don't exist on disk. This is what
// prevents "works on my machine" publishes where the exports map has drifted
// from the actual `vite build` output.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(scriptDir, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

/** Recursively collects every file path string referenced anywhere in a value. */
function collectPaths(value, out = []) {
  if (typeof value === "string") {
    if (value.startsWith("./")) out.push(value);
    return out;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) collectPaths(value[key], out);
  }
  return out;
}

const referenced = new Set([
  pkg.main,
  pkg.module,
  pkg.types,
  ...collectPaths(pkg.exports),
]);

const missing = [];
for (const relativePath of referenced) {
  if (!relativePath) continue;
  const absolutePath = path.resolve(path.dirname(pkgPath), relativePath);
  if (!existsSync(absolutePath)) missing.push(relativePath);
}

if (missing.length > 0) {
  console.error("✗ verify-exports: package.json references files that don't exist in dist/:");
  for (const file of missing) console.error(`  - ${file}`);
  console.error("\nRun `npm run build` and confirm vite.config.ts entry/fileName match exports.");
  process.exit(1);
}

console.log(`✓ verify-exports: all ${referenced.size} referenced paths exist.`);
