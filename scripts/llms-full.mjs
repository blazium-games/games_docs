import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) out.push(...files(path));
    else if (name.name.endsWith(".md") || name.name.endsWith(".mdx")) out.push(path);
  }
  return out;
}

function body(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

const parts = files(docs).sort().map(path => {
  const name = relative(root, path).replaceAll("\\", "/");
  return `# ${name}\n\n${body(readFileSync(path, "utf8"))}`;
});

const text = [
  "# Blazium Games documentation",
  "",
  "Concatenated documentation for language models. The short index is https://docs.blazium.games/llms.txt.",
  "",
  parts.join("\n\n"),
  "",
].join("\n");

writeFileSync(join(root, "static", "llms-full.txt"), text);
console.log(`wrote static/llms-full.txt (${parts.length} pages)`);
