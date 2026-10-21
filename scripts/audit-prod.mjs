#!/usr/bin/env node
// Fails when `npm audit --omit=dev` reports a critical or high advisory other
// than braces GHSA-vfj7-8cjw-p6xm. braces <=3.0.3 has no patched release.
// Docusaurus 3 pulls it through micromatch and chokidar 3. Docusaurus 4 drops
// that chain, and that upgrade is a breaking major.

import { spawnSync } from 'node:child_process';

const ALLOWED = new Set([
  'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
]);

const result = spawnSync('npm audit --omit=dev --json', {
  encoding: 'utf8',
  shell: true,
  maxBuffer: 50 * 1024 * 1024,
});

const stdout = result.stdout || '';
const start = stdout.indexOf('{');
if (start === -1) {
  process.stderr.write(result.stderr || 'npm audit produced no JSON\n');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(stdout.slice(start));
} catch (err) {
  process.stderr.write(`npm audit JSON parse failed: ${err.message}\n`);
  process.exit(1);
}

const vulns = data.vulnerabilities || {};
const unexpected = [];
for (const [name, vuln] of Object.entries(vulns)) {
  if (vuln.severity !== 'high' && vuln.severity !== 'critical') continue;
  for (const via of vuln.via || []) {
    if (typeof via === 'string' || !via.url) continue;
    if (!ALLOWED.has(via.url)) {
      unexpected.push(`${vuln.severity} ${name}: ${via.title || via.name} ${via.url}`);
    }
  }
}

const counts = data.metadata?.vulnerabilities || {};
console.log(
  `production audit: ${counts.critical || 0} critical, ${counts.high || 0} high, ${counts.moderate || 0} moderate, ${counts.low || 0} low`,
);

if (unexpected.length) {
  console.error('critical or high advisories outside the unpatched braces issue:');
  for (const line of unexpected) console.error(`- ${line}`);
  process.exit(1);
}

if ((counts.critical || 0) > 0) {
  console.error('critical advisories remain');
  process.exit(1);
}

console.log('critical and high findings are only GHSA-vfj7-8cjw-p6xm (braces, no patched release)');
