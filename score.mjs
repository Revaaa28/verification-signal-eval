// Scorer — reads results/*.jsonl + cases.json, prints the pre-registered
// metrics from study-design-draft.md §6. Descriptive only, no p-values.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const { cases } = JSON.parse(readFileSync(join(root, 'cases.json'), 'utf8'));
const byId = Object.fromEntries(cases.map((c) => [c.id, c]));
const rows = [];
for (const f of readdirSync(join(root, 'results')).filter((f) => f.endsWith('.jsonl'))) {
  for (const line of readFileSync(join(root, 'results', f), 'utf8').trim().split('\n')) {
    if (line.trim()) rows.push(JSON.parse(line));
  }
}
// Keep the LAST run per (model, case, condition).
const latest = new Map();
for (const r of rows) latest.set(`${r.model}|${r.caseId}|${r.condition}`, r);
const data = [...latest.values()];

const models = [...new Set(data.map((r) => r.model))];
const nonFree = cases.filter((c) => c.correctDecision === 'SKIP').map((c) => c.id);

for (const model of models) {
  console.log(`\n=== ${model} ===`);
  for (const cond of ['A', 'B']) {
    const rs = data.filter((r) => r.model === model && r.condition === cond);
    const valid = rs.filter((r) => r.valid);
    const acc = valid.length ? valid.filter((r) => r.correct).length / valid.length : null;
    const ff = valid.filter((r) => nonFree.includes(r.caseId));
    const falseFree = ff.length ? ff.filter((r) => r.decision === 'MINT').length / ff.length : null;
    const costs = valid.filter((r) => byId[r.caseId].trueCostBNB !== null && r.estCostBNB !== null);
    const mae = costs.length ? costs.reduce((s, r) => s + Math.abs(r.estCostBNB - byId[r.caseId].trueCostBNB), 0) / costs.length : null;
    console.log(
      `${cond}: n=${rs.length} valid=${valid.length} invalid=${rs.length - valid.length} ` +
      `accuracy=${acc === null ? '—' : (acc * 100).toFixed(1) + '%'} falseFree=${falseFree === null ? '—' : (falseFree * 100).toFixed(1) + '%'} ` +
      `costMAE=${mae === null ? '—' : mae.toFixed(6) + ' BNB'}`
    );
  }
  const table = data.filter((r) => r.model === model).sort((a, b) => a.caseId.localeCompare(b.caseId) || a.condition.localeCompare(b.condition));
  for (const r of table) {
    console.log(`  ${r.caseId.padEnd(14)} ${r.condition} -> ${r.valid ? r.decision : 'INVALID'} ${r.valid ? (r.correct ? 'ok' : 'WRONG') : ''}`);
  }
}
