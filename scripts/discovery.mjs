#!/usr/bin/env node
// Generates the discovery files served by the root site (games_nginx) and the
// MCP server (games_mcp) from this repository.
//
//   node scripts/discovery.mjs --out <dir>              write both trees under <dir>/site and <dir>/mcp
//   node scripts/discovery.mjs --site <dir> [--check]   write (or verify) the root site's public files in <dir>
//   node scripts/discovery.mjs --mcp <dir> [--check]    write (or verify) the MCP server's llms files in <dir>
//
// --check writes nothing, prints each file that differs, and exits 1 on any difference.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAll } from "./lib/discovery.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = name => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1] || null;
};
const check = args.includes("--check");

const files = buildAll(root);
let bad = 0;

function emit(prefix, dir) {
  for (const [path, text] of files) {
    if (!path.startsWith(`${prefix}/`)) continue;
    const target = join(dir, path.slice(prefix.length + 1));
    if (check) {
      const have = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : null;
      if (have !== text) {
        console.error(`${have === null ? "missing" : "differs"}: ${target}`);
        bad++;
      }
    } else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, text);
    }
  }
}

const out = flag("--out");
const site = flag("--site");
const mcp = flag("--mcp");
if (!out && !site && !mcp) {
  console.error("usage: node scripts/discovery.mjs (--out <dir> | --site <dir> | --mcp <dir>) [--check]");
  process.exit(2);
}
if (out) {
  emit("site", join(resolve(out), "site"));
  emit("mcp", join(resolve(out), "mcp"));
}
if (site) emit("site", resolve(site));
if (mcp) emit("mcp", resolve(mcp));
if (bad) {
  console.error(`${bad} discovery file(s) out of date. Regenerate with node scripts/discovery.mjs from the pinned games_docs commit.`);
  process.exit(1);
}
console.log(check ? "discovery files match" : `wrote ${files.size} discovery files`);