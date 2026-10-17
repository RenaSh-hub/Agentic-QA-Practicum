---
name: score-agent
description: Scores an agent against an answer key and appends the result to eval-report.md. Use when the user asks how accurate an agent is, wants to score triage, self-heal, or test generation, or after cases are added to an evals/*/answer-key.json.
---

# Score agent accuracy

Measure classification quality for an agent (e.g. **triage**) against `evals/<agent>/answer-key.json`. **Report only** — do not change tests, POMs, or the answer key unless the user explicitly asks.

## Rule

The agent under test **must not read** `answer-key.json` (or derived labels) during a scoring pass. Only `input` fields from cases the human added may be shown to the agent.

## Workflow

1. **Confirm agent name** — folder `evals/<agent>/` with `answer-key.json` populated by the user (never invent cases or edit the key).
2. **One run pass** — For each case, give the agent only `input` (failure log, diff, ticket excerpt, etc.). Collect `{ id, predicted, evidence }` with `predicted` ∈ `drift` | `bug` | `ambiguous`.
3. **Write run file** — Save under `evals/<agent>/runs/<YYYY-MM-DD>-<n>.json`:

   ```json
   {
     "model": "<model slug used for the agent>",
     "startedAt": "<ISO-8601>",
     "finishedAt": "<ISO-8601>",
     "predictions": [{ "id", "predicted", "evidence" }]
   }
   ```

4. **Repeat** — Default **N = 3** independent passes (new run file each time, increment `<n>`). User may override N.
5. **Score** — From repo root:

   ```bash
   npx tsx evals/score.ts <agent>
   ```

   Non-zero exit — fix before reporting. Common causes:
   - prediction `id` not in the answer key
   - missing or invalid `answer-key.json` (including duplicate `id`s in the key)
   - no `.json` run files under `runs/`
   - invalid run file JSON or schema (labels, required fields)

   Run from any directory; `evals/score.ts` resolves paths from the repo root.

6. **Append eval-report** — Follow [eval-report](../eval-report/SKILL.md): **append only**; do not rewrite existing suite sections. Add:

   `## Agent accuracy — <agent>`

   Include agent name, model(s), run file names, and N; copy metrics from the successful `score.ts` stdout; one **How measured** line (answer key path, case count, agent did not read labels during runs).

   ```markdown
   ## Agent accuracy — triage

   **Date:** YYYY-MM-DD  
   **Runs:** N (`evals/triage/runs/<file>.json` …)  
   **Model:** `<model slug>`  
   **Cases:** <count> (`evals/triage/answer-key.json`)

   **How measured:** Agent saw only each case `input`; metrics from `npx tsx evals/score.ts triage`.

   | Metric | Value |
   | --- | --- |
   | Overall accuracy | … |
   | Drift precision / recall | … (FP …) |
   | Bug precision / recall | … (FP …) |
   | Ambiguous precision / recall | … (FP …) |
   | Cross-run agreement | … |
   ```

## Triage (`agent` = `triage`)

1. Apply [ci-failure-triage](../ci-failure-triage/SKILL.md) on each case `input` (evidence, artifacts, live `npx tsx scripts/score-evidence.ts … --verify-only` when the prompt requires it).
2. Map the live scorer + routing judgment to eval labels using **Oracle policy (locked)** in [evals/README.md](../../evals/README.md) — e.g. `decision: escalate` or `inconclusive` → `ambiguous`, not “copy `side` only.”

## Paths

| Artifact | Location |
| -------- | -------- |
| Answer key | `evals/<agent>/answer-key.json` |
| Run outputs | `evals/<agent>/runs/<date>-<n>.json` |
| Scorer | `evals/score.ts` |
| Overview | `evals/README.md` |

Starter triage key: `evals/triage/answer-key.json` (user-maintained).
