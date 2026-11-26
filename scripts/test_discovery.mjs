import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { buildAll, buildSkillIndex, parseFrontMatter, splitLlms } from "./lib/discovery.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = buildAll(root);
const get = path => {
  const text = files.get(path);
  assert.ok(text !== undefined, `${path} was not generated`);
  return text;
};
const skillNames = readdirSync(join(root, "skills")).sort();

test("generation is deterministic", () => {
  const again = buildAll(root);
  assert.deepEqual([...again.keys()], [...files.keys()]);
  for (const [path, text] of files) assert.equal(again.get(path), text, path);
});

test("the root llms.txt keeps its identity and drops stale wording", () => {
  const txt = get("site/llms.txt");
  assert.ok(txt.startsWith("# Blazium Games\n\n> Blazium Games is the First-Stage Storefront.\n"));
  assert.ok(txt.includes("Prefer the structured MCP servers over scraping HTML: [developer](https://mcp.blazium.games/developer) and [player](https://mcp.blazium.games/player)."));
  assert.ok(txt.includes("Other indexes: https://mcp.blazium.games/llms.txt and https://docs.blazium.games/llms.txt."));
  const stripped = txt.toLowerCase().replaceAll("first-stage storefront", "").replaceAll("https://docs.blazium.games/docs/storefront/", "");
  assert.ok(!stripped.includes("storefront"), "the word storefront appears outside the brand line and doc links");
  assert.ok(!txt.includes("native desktop app"), "the launcher is BlaziumLauncher");
  assert.ok(txt.includes("BlaziumLauncher"));
  for (const word of ["Pricing", "Publishing", "Education", "skill.md", "agent-skills/index.json", "title_line2", "chauffeur blog", "rss.xml"]) {
    assert.ok(txt.includes(word), `missing ${word}`);
  }
});

test("section headings are unique in every llms.txt", () => {
  for (const path of ["site/llms.txt", "mcp/llms.txt"]) {
    const titles = [...get(path).matchAll(/^## (.+)$/gm)].map(m => m[1]);
    assert.equal(new Set(titles).size, titles.length, `${path} repeats a section: ${titles.join(", ")}`);
  }
});

test("the root llms.txt does not repeat sections it replaces", () => {
  const titles = [...get("site/llms.txt").matchAll(/^## (.+)$/gm)].map(m => m[1]);
  assert.ok(!titles.includes("Legal and support"));
  assert.ok(!titles.includes("MCP and the player server"));
});

test("the MCP llms.txt is the connect steps plus discovery", () => {
  const txt = get("mcp/llms.txt");
  assert.ok(txt.startsWith("# Blazium Games MCP\n"));
  for (const want of ["initialize", "https://mcp.blazium.games/developer", "https://mcp.blazium.games/player", "## Discovery", "skill.md"]) {
    assert.ok(txt.includes(want), `missing ${want}`);
  }
  assert.ok(txt.includes("Other indexes: https://blazium.games/llms.txt and https://docs.blazium.games/llms.txt."));
});

test("llms-full is the same documentation for every host", () => {
  const full = get("site/llms-full.txt");
  assert.equal(get("mcp/llms-full.txt"), full);
  assert.ok(full.includes("# Blazium Games documentation"));
  assert.ok(full.includes("# docs/discovery.md"));
  assert.ok(!/^---\ntitle:/m.test(full), "front matter leaked into llms-full");
});

test("every skill is served and listed with the digest of the served bytes", () => {
  const index = JSON.parse(get("site/.well-known/agent-skills/index.json"));
  assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
  assert.deepEqual(index.skills.map(s => s.name), skillNames);
  for (const entry of index.skills) {
    assert.equal(entry.type, "skill-md");
    assert.equal(entry.url, `/.well-known/agent-skills/${entry.name}/SKILL.md`);
    assert.ok(entry.description.length > 0);
    const served = get(`site${entry.url}`);
    assert.equal(entry.digest, `sha256:${createHash("sha256").update(served, "utf8").digest("hex")}`);
    assert.equal(parseFrontMatter(served).name, entry.name);
  }
  assert.equal(buildSkillIndex(index.skills.map(s => ({ ...s, text: "" }))), get("site/.well-known/agent-skills/index.json"));
});

test("served skills have no relative links left", () => {
  for (const name of skillNames) {
    const text = get(`site/.well-known/agent-skills/${name}/SKILL.md`).replace(/```[\s\S]*?```/g, "");
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      assert.ok(/^(https?:|mailto:|#)/.test(target), `${name}: relative link ${target}`);
    }
  }
});

test("skill.md routes to every skill", () => {
  const md = get("site/skill.md");
  const fm = parseFrontMatter(md);
  assert.equal(fm.name, "blazium-games");
  assert.ok(fm.description);
  for (const name of skillNames) {
    assert.ok(md.includes(`https://blazium.games/.well-known/agent-skills/${name}/SKILL.md`), `skill.md misses ${name}`);
  }
  assert.ok(md.includes("https://mcp.blazium.games/developer") && md.includes("https://mcp.blazium.games/player"));
});

test("the docs map splits into a Start here block and sections", () => {
  const { start, sections } = splitLlms(readFileSync(join(root, "static", "llms.txt"), "utf8"));
  assert.ok(start.startsWith("## Start here"));
  assert.ok(sections.length >= 5);
  assert.ok(sections.every(s => s.text.startsWith("## ")));
});

test("README, SKILL_TREE.md, and skills/ list the same skills", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const tree = readFileSync(join(root, "SKILL_TREE.md"), "utf8");
  for (const name of skillNames) {
    assert.ok(readme.includes(`(skills/${name}/SKILL.md)`), `README.md misses ${name}`);
    assert.ok(tree.includes(`(skills/${name}/SKILL.md)`), `SKILL_TREE.md misses ${name}`);
  }
  for (const [, name] of readme.matchAll(/\(skills\/([a-z0-9-]+)\/SKILL\.md\)/g)) {
    assert.ok(skillNames.includes(name), `README.md lists ${name}, which is not in skills/`);
  }
});
test("generated files do not link to hosts that no longer resolve", () => {
  const dead = ["dddbrowser.online", "rune.shoyo.work", "shoyo.work"];
  for (const [path, text] of files) {
    for (const host of dead) assert.ok(!text.includes(host), `${path} links to ${host}`);
  }
});
