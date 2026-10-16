---
name: score-agent
description: Scores an agent against an answer key and appends the result to eval-report.md. Use when the user asks how accurate an agent is, wants to score triage, self-heal, or test generation, or after cases are added to an evals/*/answer-key.json.
---

# Score agent

Measure how often an agent’s classification matches `evals/<agent>/answer-key.json` and record the result in **`eval-report.md`**.

## Rule

The agent under test **must not read** `answer-key.json` (or any path under `evals/<agent>/answer-key.json`) during a scoring run.

## Prerequisites

- Ground-truth cases in `evals/<agent>/answer-key.json` (`id`, `input`, `expected` where `expected` is `drift` | `bug` | `ambiguous`). **Do not edit the answer key** — the human fills it.
- Run output directory: `evals/<agent>/runs/`.

## Workflow

1. **Confirm agent name** (e.g. `triage`) and run count **N** (default **3**).
2. **For each run** `n = 1 … N`:
   - For **each case** in the answer key, give the agent only the case `input` (and any artifacts the scenario requires). Do not expose `expected` or the answer key file.
   - Collect `{ id, predicted, evidence }` per case (`predicted` must be `drift`, `bug`, or `ambiguous`).
   - Write `evals/<agent>/runs/<YYYY-MM-DD>-<n>.json`:

     ```json
     {
       "model": "<model slug used>",
       "startedAt": "<ISO-8601>",
       "finishedAt": "<ISO-8601>",
       "predictions": [{ "id": "...", "predicted": "...", "evidence": "..." }]
     }
     ```

3. **Score:** from repo root, run `npx tsx evals/score.ts <agent>`. Fix run files if scoring exits non-zero (e.g. unknown `id`).
4. **Append to `eval-report.md`** a dated section **Agent accuracy — `<agent>`** including:
   - Date and **N** runs, model name(s), and case count.
   - **How measured:** agent run without answer key; pooled metrics from `evals/score.ts`.
   - Output metrics: per-class precision/recall, overall accuracy, false positives per class, run agreement (and the agreement denominator note from the scorer).
5. Do **not** remove or rewrite prior sections in `eval-report.md`; append only.

## When to use

- User asks for agent accuracy, triage/self-heal/generation quality, or stability across runs.
- New cases were added to an `evals/*/answer-key.json` and need a fresh score.
