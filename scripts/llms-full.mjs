import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFull } from "./lib/discovery.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { text, pages } = buildFull(root);
writeFileSync(join(root, "static", "llms-full.txt"), text);
console.log(`wrote static/llms-full.txt (${pages} pages)`);