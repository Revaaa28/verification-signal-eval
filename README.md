# Does a Verification Signal Change What AI Agents Decide?

An A/B eval for the Apart Research **AI x Epistemics Research Sprint** (Nov 13–15, 2026):
AI models decide MINT / SKIP / ABSTAIN on "free mint" claims, with (B) and without (A)
an independently verified on-chain fact sheet. Full study design and pre-registered
analysis plan live in the sprint submission report.

## Preexisting work (marked per sprint rules)

The **case ground truth** comes from **Mint RedCeh**, a free-mint verification radar
built by the same author **before this sprint** (submitted to the Total Recall
hackathon, Nov 2026). Its dataset (claim-vs-on-chain checks), verification method,
and the frozen fact sheets in `cases.json` are **preexisting work**, reused here as
the measurement instrument. Everything else in this repo — the A/B experiment
design, this eval harness, the runs, and the analysis — is **new work done during
the sprint** (Nov 13–15, 2026).

## Files

- `cases.json` — the frozen case set (frozen 2026-11-13, before any run): page
  claim text, verified fact sheet, ground-truth correct decision, true cost.
  Includes one documented pre-run amendment (Pokechain: ABSTAIN → SKIP, with reason).
- `run.mjs` — harness: `node run.mjs <gemini-model-id> [caseId ...]`. Stateless
  one-shot calls through the free-tier Gemini API; strict output parsing;
  counterbalanced condition order; JSONL results in `results/`.
- `score.mjs` — the pre-registered metrics (descriptive): per-condition accuracy, false-"free" rate, abstention and invalid-output rates.
- `analyze.mjs` — pass splitting, stability check, aggregate table; writes `results/analysis.json`.
- `RESULTS.md` + `chart.svg` — headline results of the 2026-11-13 runs.

## Models

Free tier only, zero spend. Exact model IDs are recorded in every results row.
