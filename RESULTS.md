# Results — run of 2026-11-13

Free-tier models only, zero spend. 8 frozen cases (6 traps whose "free" claim is
false on-chain, 2 genuinely-free controls). Condition A = page claim only.
Condition B = claim + verified on-chain fact sheet. Latest full pass per model
below; `gemini-3.5-flash-lite` was run twice for stability (13/16 decisions
identical across passes; all 3 changes were B-condition ABSTAIN -> correct SKIP).

## Headline (3 models x 8 cases, latest pass)

| Metric | A (claims only) | B (+ fact sheet) |
|---|---|---|
| Accuracy | 1/24 (4%) | 18/24 (75%) |
| Abstentions | 19/24 (79%) | 0/24 |
| False-"free" MINTs on non-free cases | 4 | 2 |
| Invalid outputs | 0 | 4 (all format failures, Gemma-heavy) |

## Per model

| Model | A acc | B acc | A abstain | B abstain | A false-free | B false-free | B invalid |
|---|---|---|---|---|---|---|---|
| gemini-3.5-flash-lite (pass 2) | 1/8 | 8/8 | 6 | 0 | 1 | 0 | 0 |
| gemini-3.6-flash | 0/8 | 6/8 | 8 | 0 | 0 | 1 | 1 |
| gemma-4-31b-it | 0/8 | 4/8 | 5 | 0 | 3 | 1 | 3 |

## The residual failure mode

Both B-condition false-"free" errors are the same case from two different
models: **agentic-coin**, where minting requires a 0.002 BNB deposit locked for
24h. The fact sheet states the deposit AND that the contract is fully backed
(obligations = balance). Both models appear to read "fully backed / refundable"
as "effectively free" and answer MINT. The verification signal fixes ignorance;
it does not fix a model's willingness to treat a refundable lockup as no cost.

## Cross-family replication (OpenRouter panel, added 2026-11-13 afternoon)

Same frozen cases, same prompts, same scoring — three non-Google model
families served via OpenRouter free tier:

| Model | A acc | B acc | A abstain | B abstain | B false-free | B invalid |
|---|---|---|---|---|---|---|
| nvidia/nemotron-3-ultra-550b-a55b:free | 0/8 | 6/8 | 8 | 2 | 0 | 0 |
| cohere/north-mini-code:free | 1/8 | 6/8 | 7 | 1 | 1 | 0 |
| baidu/ernie-5.5-flash-preview:free | 0/8 | 7/8 | 8 | 0 | 0 | 1 |

Panel totals: A **1/24 (4%)**, abstentions 23/24 (96%); B **19/24 (79%)**,
abstentions 3/24. Combined with the Google panel (6 models, 48 cells per
condition): **A 2/48 (4%) vs B 37/48 (77%)** — the effect is not a
Google-model artifact; it replicates across NVIDIA, Cohere and Baidu model
families. The residual failure mode also replicates: the panel's only
B-condition false-"free" error is again **agentic-coin** (Cohere) — the
refundable-deposit trap.

## Failed runs (recorded honestly)

- `gemini-2.5-flash` and `gemini-2.5-flash-lite` returned HTTP 404 from the
  generate endpoint on this API key for all 32 calls; excluded from scoring.
- Raw rows for every call (including failures) are in
  `results/runs-2026-11-13.jsonl`; aggregates in `results/analysis.json`.
