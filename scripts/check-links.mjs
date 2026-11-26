#!/usr/bin/env node
// Requests every absolute URL in the generated discovery files and fails on any that does not
// answer. Network access is required, so it runs on a schedule and by hand, not on every PR.
//
//   node scripts/check-links.mjs            check the files generated from this checkout
//   node scripts/check-links.mjs --list     print the URLs without requesting them
//
// A URL with a placeholder (<you>, {slug}) or a mailto: link is skipped. Fragments are ignored.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAll } from "./lib/discovery.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const listOnly = process.argv.includes("--list");

// Endpoints that are not meant to be read with a plain GET still answer, and that proves they exist.
const ACCEPT = new Map([
  ["https://mcp.blazium.games/developer", [401, 405, 406]],
  ["https://mcp.blazium.games/player", [401, 405, 406]],
  ["https://mcp.blazium.games/mcp", [401, 405, 406]],
  ["https://api.blazium.online/api/v1/public/crashes", [404, 405]],
  ["https://api.blazium.online/api/v1/tool/upload/build", [404, 405]],
  ["https://api.blazium.online/api/v1/public/asset-library", [404]],
  ["https://uploader.blazium.online/api/v1/tool/upload/files", [404, 405]],
  ["https://uploader.blazium.online/api/v1/tool/upload/sessions", [404, 405]],
]);

// Identifiers, not pages.
const SKIP = new Set(["https://schemas.agentskills.io/discovery/0.2.0/schema.json"]);

// A broken link on a host we run fails the check. Other sites only warn.
const OURS = /^https:\/\/([a-z0-9-]+\.)*(blazium\.games|blazium\.online|blazium\.app)(\/|$)|^https:\/\/github\.com\/blazium-games(\/|$)/;

export function urlsIn(text) {
  const found = new Set();
  for (const [url] of text.matchAll(/https?:\/\/[^\s)>\]"'`,]+/g)) {
    const clean = url.replace(/[.:;]+$/, "").split("#")[0];
    if (/[<>{}]/.test(clean) || clean.includes("localhost") || clean === "https://" || clean === "http://" || SKIP.has(clean)) continue;
    found.add(clean);
  }
  return found;
}

const files = buildAll(root);
const urls = new Set();
for (const [path, text] of files) {
  if (path.endsWith("llms-full.txt")) continue;
  for (const url of urlsIn(text)) urls.add(url);
}

if (listOnly) {
  console.log([...urls].sort().join("\n"));
  process.exit(0);
}

async function check(url) {
  const accept = ACCEPT.get(url) || [];
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "blazium-link-check" } });
      if (res.ok || accept.includes(res.status)) return null;
      if (method === "GET") return `${res.status}`;
    } catch (err) {
      if (method === "GET") return String(err.cause?.code || err.message);
    }
  }
  return "no answer";
}

const bad = [];
const warn = [];
const queue = [...urls].sort();
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let url = queue.shift(); url; url = queue.shift()) {
    const problem = await check(url);
    if (problem) (OURS.test(url) ? bad : warn).push(`${problem} ${url}`);
  }
}));

console.log(`${urls.size} URLs checked`);
if (warn.length) console.warn(`${warn.length} other-site link(s) did not answer:\n  ${warn.sort().join("\n  ")}`);
if (bad.length) {
  console.error(`${bad.length} broken:\n  ${bad.sort().join("\n  ")}`);
  process.exit(1);
}