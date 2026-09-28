#!/usr/bin/env node
// Validates the Cursor plugin: manifests, skill front matter, relative links,
// and that every capability on the live MCP server card is documented.
// Usage: node scripts/check-plugin.mjs [--offline]

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const offline = process.argv.includes('--offline');
const serverCardURL =
  process.env.SERVER_CARD_URL || 'https://mcp.blazium.games/.well-known/mcp/server-card.json';
const playerServerCardURL =
  process.env.PLAYER_SERVER_CARD_URL || 'https://mcp.blazium.games/.well-known/mcp/player-server-card.json';

const errors = [];
const fail = (msg) => errors.push(msg);
const rel = (p) => relative(root, p).replaceAll('\\', '/');

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`${rel(path)}: invalid JSON (${err.message})`);
    return null;
  }
}

function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

function checkManifests() {
  const plugin = readJSON(join(root, '.cursor-plugin', 'plugin.json'));
  const market = readJSON(join(root, '.cursor-plugin', 'marketplace.json'));
  const mcp = readJSON(join(root, 'mcp.json'));
  if (!plugin) return;

  for (const key of ['name', 'displayName', 'version', 'description', 'license', 'skills', 'mcpServers']) {
    if (!plugin[key]) fail(`plugin.json: missing "${key}"`);
  }
  for (const key of ['logo', 'skills', 'mcpServers']) {
    if (plugin[key] && !existsSync(join(root, plugin[key]))) {
      fail(`plugin.json: "${key}" points to missing path ${plugin[key]}`);
    }
  }

  if (market) {
    const entry = (market.plugins || []).find((p) => p.name === plugin.name);
    if (!entry) fail(`marketplace.json: no plugin named "${plugin.name}"`);
    else if (entry.source && !existsSync(join(root, entry.source))) {
      fail(`marketplace.json: source ${entry.source} does not exist`);
    }
  }

  if (mcp) {
    const servers = Object.values(mcp.mcpServers || {});
    if (servers.length === 0) fail('mcp.json: no mcpServers');
    for (const s of servers) {
      if (!s.url || !s.url.startsWith('https://')) fail(`mcp.json: server url must be https (${s.url})`);
    }
  }
}

function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

function checkSkills() {
  const skillsDir = join(root, 'skills');
  const names = existsSync(skillsDir) ? readdirSync(skillsDir) : [];
  if (names.length === 0) fail('skills/: no skills found');
  const tree = existsSync(join(root, 'SKILL_TREE.md')) ? readFileSync(join(root, 'SKILL_TREE.md'), 'utf8') : '';
  if (!tree) fail('SKILL_TREE.md: missing');

  for (const name of names) {
    const file = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(file)) {
      fail(`skills/${name}: missing SKILL.md`);
      continue;
    }
    const fm = parseFrontMatter(readFileSync(file, 'utf8'));
    if (!fm) {
      fail(`${rel(file)}: missing front matter`);
      continue;
    }
    if (fm.name !== name) fail(`${rel(file)}: front matter name "${fm.name}" does not match folder "${name}"`);
    if (!fm.description) fail(`${rel(file)}: missing description`);
    if (!fm.license) fail(`${rel(file)}: missing license`);
    if (tree && !tree.includes(`skills/${name}/SKILL.md`)) fail(`SKILL_TREE.md: does not link skills/${name}`);
  }
}

function checkLinks() {
  const files = [
    ...walk(join(root, 'skills'), '.md'),
    join(root, 'SKILL_TREE.md'),
    join(root, 'README.md'),
  ].filter(existsSync);
  const linkRe = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const file of files) {
    const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, target] of text.matchAll(linkRe)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
      const path = decodeURIComponent(target.split('#')[0]);
      if (!path) continue;
      if (!existsSync(resolve(dirname(file), path))) fail(`${rel(file)}: broken link ${target}`);
    }
  }
}

async function checkServerCard(url, skill, docsPage) {
  if (offline) {
    console.log(`Skipping server card coverage for ${url} (--offline).`);
    return;
  }
  let card;
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    card = await res.json();
  } catch (err) {
    fail(`server card: could not fetch ${url} (${err.message})`);
    return;
  }

  const expected = [
    ...(card.tools || []).map((t) => ['tool', t.name]),
    ...(card.prompts || []).map((p) => ['prompt', p.name]),
    ...(card.resources || []).map((r) => ['resource', r.uri]),
    ...(card.resourceTemplates || []).map((r) => ['resource template', r.uriTemplate]),
  ].filter(([, v]) => v);
  if (expected.length === 0) fail(`server card ${url}: no capabilities listed`);

  const refsDir = join(root, 'skills', skill, 'references');
  const refsText = walk(refsDir, '.md')
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  const docsRef = join(root, 'docs', 'mcp', docsPage);
  const docsText = existsSync(docsRef) ? readFileSync(docsRef, 'utf8') : '';
  if (!docsText) fail(`docs/mcp/${docsPage}: missing`);

  for (const [kind, value] of expected) {
    if (!refsText.includes(value)) fail(`${rel(refsDir)}: ${kind} "${value}" is not documented`);
    if (docsText && !docsText.includes(value)) fail(`docs/mcp/${docsPage}: ${kind} "${value}" is not documented`);
  }
  console.log(`Server card ${url}: ${expected.length} capabilities checked.`);
}

checkManifests();
checkSkills();
checkLinks();
await checkServerCard(serverCardURL, 'blazium-games-get-started', 'reference.md');
await checkServerCard(playerServerCardURL, 'blazium-games-player', 'player.md');

if (errors.length) {
  console.error(`Plugin check failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exitCode = 1;
} else {
  console.log('Plugin check passed.');
}
