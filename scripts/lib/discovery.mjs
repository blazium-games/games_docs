// Builds every machine-readable discovery file from this repository, so the
// docs site, the root site (games_nginx), and the MCP server (games_mcp) all
// serve the same facts. Pure functions: nothing here touches the network.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const SITE = "https://blazium.games";
export const SKILLS_BASE = "/.well-known/agent-skills";
export const SKILL_SOURCE = "https://github.com/blazium-games/games_docs/blob/master/skills";
export const INDEX_SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

/** Sections of the docs map the root site does not repeat, because its appendix covers them. */
export const SITE_SKIPPED_SECTIONS = ["MCP and the player server", "Legal and support"];

const SITE_HEADER = [
  "# Blazium Games",
  "",
  "> Blazium Games is the First-Stage Storefront.",
  "> Full documentation for language models: https://blazium.games/llms-full.txt",
  "",
].join("\n");

const MCP_HEADER = [
  "# Blazium Games MCP",
  "",
  "> Blazium Games is a game publishing platform, with an infrastructure focus.",
  "> Full documentation for language models: https://mcp.blazium.games/llms-full.txt",
  "",
].join("\n");

const MCP_DISCOVERY = `## Discovery

- [Developer server card](https://mcp.blazium.games/.well-known/mcp/server-card.json): Authentication, tools, prompts, resources, and deprecations.
- [Player server card](https://mcp.blazium.games/.well-known/mcp/player-server-card.json): The player server's tools and authentication.
- [Developer protected resource](https://mcp.blazium.games/.well-known/oauth-protected-resource/developer): RFC 9728 discovery for the developer endpoint. \`https://mcp.blazium.games/mcp\` is the same server.
- [Player protected resource](https://mcp.blazium.games/.well-known/oauth-protected-resource/player): RFC 9728 discovery for the player endpoint.
- [Player authorization server](https://mcp.blazium.games/.well-known/oauth-authorization-server/player): RFC 8414 discovery for the player endpoint.
- [chauffeur CLI](https://docs.blazium.games/docs/cli): Uploads builds, images, and symbols. MCP never uploads files.
- [Developer setup](https://docs.blazium.games/docs/mcp): Cursor, VS Code, Claude Code, scopes, and OAuth.
- [Player setup](https://docs.blazium.games/docs/mcp/player): Player scopes, keys, and tools.
- [Agent skills](https://blazium.games/skill.md): Which skill to load for which job. The index with a digest for each skill is https://blazium.games/.well-known/agent-skills/index.json.
`;

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(path));
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) out.push(path);
  }
  return out;
}

function stripFrontMatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

/** Parses the simple `key: value` front matter the skills use. */
export function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return out;
}

/** Normalises line endings so the output does not depend on the checkout's autocrlf. */
function lf(text) {
  return text.replace(/\r\n/g, "\n");
}

/** The concatenated documentation, one `# docs/<path>` block per page. */
export function buildFull(root) {
  const docs = join(root, "docs");
  const parts = walkMarkdown(docs)
    .map(path => relative(root, path).replaceAll("\\", "/"))
    .sort()
    .map(name => `# ${name}\n\n${stripFrontMatter(lf(readFileSync(join(root, name), "utf8")))}`);
  const text = [
    "# Blazium Games documentation",
    "",
    "Concatenated documentation for language models. The short indexes are https://docs.blazium.games/llms.txt, https://blazium.games/llms.txt, and https://mcp.blazium.games/llms.txt.",
    "",
    parts.join("\n\n"),
    "",
  ].join("\n");
  return { text, pages: parts.length };
}

/** Splits the docs map into its preamble, the Start here block, and the other sections. */
export function splitLlms(text) {
  const lines = lf(text).split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      current = { title: heading[1].trim(), lines: [line] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  const body = section => section.lines.join("\n").replace(/\s+$/, "") + "\n";
  const start = sections.find(s => s.title === "Start here");
  if (!start) throw new Error("static/llms.txt has no '## Start here' section");
  return {
    start: body(start),
    sections: sections.filter(s => s !== start).map(s => ({ title: s.title, text: body(s) })),
  };
}

/** The `Other indexes:` line differs per host, so the shared block is rewritten for each. */
function withOtherIndexes(startText, line) {
  const next = startText.replace(/^Other indexes: .*$/m, line);
  if (next === startText && !startText.includes(line)) throw new Error("Start here has no 'Other indexes:' line");
  return next;
}

export function buildSiteLlms(root, docsMap) {
  const { start, sections } = splitLlms(docsMap);
  const appendix = lf(readFileSync(join(root, "scripts", "templates", "site-appendix.md"), "utf8")).trim() + "\n";
  const shared = sections.filter(s => !SITE_SKIPPED_SECTIONS.includes(s.title)).map(s => s.text);
  return [
    SITE_HEADER,
    withOtherIndexes(start, "Other indexes: https://mcp.blazium.games/llms.txt and https://docs.blazium.games/llms.txt."),
    ...shared,
    appendix,
  ].join("\n");
}

export function buildMcpLlms(docsMap) {
  const { start } = splitLlms(docsMap);
  return [
    MCP_HEADER,
    withOtherIndexes(start, "Other indexes: https://blazium.games/llms.txt and https://docs.blazium.games/llms.txt."),
    MCP_DISCOVERY,
  ].join("\n");
}

/**
 * Skill files as they are served from /.well-known/agent-skills/<name>/SKILL.md.
 * A skill's relative links (references/...) would break there, so they point at the repository.
 */
export function readSkills(root) {
  const dir = join(root, "skills");
  const skills = [];
  for (const name of readdirSync(dir).sort()) {
    const file = join(dir, name, "SKILL.md");
    if (!existsSync(file)) continue;
    const raw = lf(readFileSync(file, "utf8"));
    const fm = parseFrontMatter(raw);
    if (!fm || !fm.name || !fm.description) throw new Error(`skills/${name}/SKILL.md: missing name or description`);
    const served = raw.replace(/\]\(((?!https?:|mailto:|#|\/)[^)\s]+)\)/g, (_, target) => `](${SKILL_SOURCE}/${name}/${target})`);
    skills.push({ name: fm.name, description: fm.description, text: served, digest: `sha256:${sha256(served)}` });
  }
  if (skills.length === 0) throw new Error("skills/: no skills found");
  return skills;
}

export function buildSkillIndex(skills) {
  return JSON.stringify({
    $schema: INDEX_SCHEMA,
    skills: skills.map(s => ({
      name: s.name,
      type: "skill-md",
      description: s.description,
      url: `${SKILLS_BASE}/${s.name}/SKILL.md`,
      digest: s.digest,
    })),
  }, null, 2) + "\n";
}

/** The router page an agent reads first: which skill for which job. */
export function buildSkillMd(skills) {
  const rows = skills.map(s => `| [${s.name}](${SITE}${SKILLS_BASE}/${s.name}/SKILL.md) | ${s.description.replaceAll("|", "\\|")} |`);
  return [
    "---",
    "name: blazium-games",
    "description: Routes an agent to the right Blazium Games skill: store pages, builds, crash reporting, analytics, keys, engine bindings, the Scripted API, and the player server. Start here when a task mentions Blazium Games.",
    "license: MIT",
    "---",
    "",
    "# Blazium Games",
    "",
    "Blazium Games is a game publishing platform. Agents work through two hosted MCP servers and one command-line uploader. This page says which skill to load. Load one skill per job and read its references before you call a tool.",
    "",
    "## Connect first",
    "",
    "- Developer server: `https://mcp.blazium.games/developer`. Pages, builds, analytics, crashes, keys, payouts.",
    "- Player server: `https://mcp.blazium.games/player`. Search, library, reviews, purchases, installs.",
    "- Add the URL only. Do not set an `Authorization` header: the first tool call opens the sign-in and consent page, or the agent calls `elevate_session` with a saved key.",
    "- The step-by-step guide is [llms.txt](https://mcp.blazium.games/llms.txt). The whole documentation is [llms-full.txt](https://blazium.games/llms-full.txt).",
    "- MCP never uploads files. Builds, images, and symbols go through the [chauffeur CLI](https://docs.blazium.games/docs/cli).",
    "",
    "## Skills",
    "",
    "| Skill | Use it when |",
    "|-------|-------------|",
    ...rows,
    "",
    "Every skill is a Markdown file with front matter. The index with a sha256 digest for each file is [index.json](" + SITE + SKILLS_BASE + "/index.json). Install them all with `npm install @blazium-games/skills`, or from Cursor Settings > Plugins with `blazium-games/games_skill`.",
    "",
    "## Rules that hold for every skill",
    "",
    "- Send `accept_legal`, `accept_developer_terms`, and authenticator choices only after the person agrees. Never accept terms for them.",
    "- Never print or commit a key. A developer key starts with `bgames_mcp_`, a player key with `bgames_play_`, and a deploy key is per game.",
    "- A token belongs to one server. Buying and the wallet are only on the player server and need the person's spending limit.",
    "- Risky actions, such as rotating a key, deleting a build, or promoting to stable, wait for the owner's approval by email.",
    "",
  ].join("\n");
}

/** Every generated file, as a Map of relative path to text. */
export function buildAll(root) {
  const docsMap = lf(readFileSync(join(root, "static", "llms.txt"), "utf8"));
  const { text: full } = buildFull(root);
  const skills = readSkills(root);
  const out = new Map();
  out.set("site/llms.txt", buildSiteLlms(root, docsMap));
  out.set("site/llms-full.txt", full);
  out.set("site/skill.md", buildSkillMd(skills));
  out.set(`site${SKILLS_BASE}/index.json`, buildSkillIndex(skills));
  for (const s of skills) out.set(`site${SKILLS_BASE}/${s.name}/SKILL.md`, s.text);
  out.set("mcp/llms.txt", buildMcpLlms(docsMap));
  out.set("mcp/llms-full.txt", full);
  return out;
}
