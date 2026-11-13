import fs from 'node:fs';
const cases = JSON.parse(fs.readFileSync('cases.json', 'utf8')).cases;
const want = Object.fromEntries(cases.map(c => [c.id, c.correctDecision]));
const nonFree = new Set(cases.filter(c => c.correctDecision === 'SKIP').map(c => c.id));
let rows = fs.readFileSync('results/runs-2026-11-13.jsonl', 'utf8').trim().split('\n').map(JSON.parse)
  .filter(r => !r.model.startsWith('gemini-2.5'));
// split passes per model: a repeated (case|cond) key closes the current pass
const byModel = new Map();
for (const r of rows.sort((a, b) => a.ts < b.ts ? -1 : 1)) {
  if (!byModel.has(r.model)) byModel.set(r.model, []);
  byModel.get(r.model).push(r);
}
const passes = {};
for (const [model, rs] of byModel) {
  const list = []; let cur = new Map();
  for (const r of rs) {
    const k = r.caseId + '|' + r.condition;
    if (cur.has(k)) { list.push(cur); cur = new Map(); }
    cur.set(k, r);
  }
  list.push(cur);
  passes[model] = list.filter(p => p.size === 16);
}
function metrics(pass) {
  const out = {};
  for (const cond of ['A', 'B']) {
    const cells = [...pass.values()].filter(r => r.condition === cond);
    const scored = cells.filter(r => r.decision);
    out[cond] = {
      correct: scored.filter(r => r.decision === want[r.caseId]).length,
      abstain: scored.filter(r => r.decision === 'ABSTAIN').length,
      invalid: cells.length - scored.length,
      falseFree: scored.filter(r => nonFree.has(r.caseId) && r.decision === 'MINT').length,
    };
  }
  return out;
}
const summary = {};
for (const [model, ps] of Object.entries(passes)) {
  summary[model] = ps.map((p, i) => ({ pass: i + 1, ...metrics(p) }));
  ps.forEach((p, i) => {
    console.log(`\n== ${model} pass ${i + 1}`);
    for (const c of cases) {
      const a = p.get(c.id + '|A'), b = p.get(c.id + '|B');
      console.log(`${c.id.padEnd(14)} want=${want[c.id].padEnd(7)} A=${(a?.decision || 'INVALID').padEnd(8)} B=${b?.decision || 'INVALID'}`);
    }
  });
}
console.log('\n== SUMMARY', JSON.stringify(summary, null, 1));
let A = { correct: 0, abstain: 0, falseFree: 0, invalid: 0 }, B = { correct: 0, abstain: 0, falseFree: 0, invalid: 0 };
for (const ps of Object.values(summary)) {
  const last = ps[ps.length - 1];
  for (const k of Object.keys(A)) { A[k] += last.A[k]; B[k] += last.B[k]; }
}
const M = Object.keys(summary).length;
console.log(`AGGREGATE latest-pass (${M} models x 8): A correct ${A.correct}/${M * 8} abstain ${A.abstain} invalid ${A.invalid} falseFree ${A.falseFree} | B correct ${B.correct}/${M * 8} abstain ${B.abstain} invalid ${B.invalid} falseFree ${B.falseFree}`);
// stability for the replicated model
const rep = passes['gemini-3.5-flash-lite'];
if (rep && rep.length > 1) {
  let same = 0;
  for (const k of rep[0].keys()) if (rep[0].get(k).decision === rep[1].get(k).decision) same++;
  console.log(`STABILITY gemini-3.5-flash-lite pass1 vs pass2: ${same}/16 identical decisions`);
}
fs.writeFileSync('results/analysis.json', JSON.stringify({ summary, aggregate: { A, B, models: M } }, null, 1));
