# Agent evals

Add cases to `evals/<agent>/answer-key.json` (`{ "id", "input", "expected" }`, `expected` ∈ `drift` | `bug` | `ambiguous`).
Run the agent on each `input` without reading the answer key; save `evals/<agent>/runs/<date>-<n>.json` with `predictions`.
Score with `npx tsx evals/score.ts <agent>` (loads the key and every run file for that agent).
Prints per-class precision/recall, overall accuracy, false positives per class, and cross-run agreement.
Use the **score-agent** skill to repeat runs (default 3), score, and append **Agent accuracy** to `eval-report.md`.

## Triage answer-key cases

Ground truth is **`drift` | `bug` | `ambiguous`** (human oracle). Each case `input` should describe a real or fixture failure plus paths to artifacts — not the label.

Use [`config/evidence-rubric.json`](../config/evidence-rubric.json) and the **Evidence rubric** in [ci-failure-triage](../.cursor/skills/ci-failure-triage/SKILL.md) to know what to collect (R1–R4, D*, B*). Fixture packs live under [`scripts/evidence-fixtures/`](../scripts/evidence-fixtures/).

| Eval `expected` | Typical signals |
| --- | --- |
| `drift` | Stable re-run; drift weighted items ≥ act threshold (often D1 + D2); heal-only fix in `pages/` |
| `bug` | Stable re-run; bug weighted items ≥ act threshold (often B1 + B3); app contradicts AC |
| `ambiguous` | Missing required items, drift+bug contradiction, re-run **passed** (flaky), escalate band, or invalid evidence — see classification guide in ci-failure-triage |

## Oracle policy (locked)

Eval labels measure **confident routing**, not “copy the scorer’s `side`.” Production still uses live `score-evidence.ts` for heal/bug gates; the answer key is a separate human oracle for agent quality.

| Rule | Meaning |
| --- | --- |
| **`drift`** | You would **act** and **self-heal** (POM/locator only): stable re-run, AC still describes intended product behavior, drift evidence at or above act threshold. |
| **`bug`** | You would **act** and **file a bug**: stable re-run, app contradicts Jira/feature AC, bug evidence at or above act threshold. |
| **`ambiguous`** | You would **not** act without more input: `escalate`, `inconclusive`, missing required evidence, drift+bug contradiction, flaky re-run (pass without product change), invalid evidence (e.g. forbidden fields), or weak oracle (neutral **N**). |

**Scorer vs eval (do not conflate):**

| Live scorer output | Eval `expected` |
| --- | --- |
| `decision: act`, `side: drift` | `drift` |
| `decision: act`, `side: bug` | `bug` |
| `decision: escalate` (any `side`) | `ambiguous` |
| `decision: inconclusive` | `ambiguous` |
| Mixed drift+bug weighted items (contradiction rules) | `ambiguous` |

**Fixture answer key (v1):** eight cases under [`scripts/evidence-fixtures/`](../scripts/evidence-fixtures/) — `min-act-drift` → `drift`; `min-act-bug` → `bug`; all others in the set → `ambiguous` (including `min-escalate`, which scores `side: drift` but `decision: escalate`). Change this table only by editing the answer key and noting the change here.

**Maintainer:** do not relabel cases after agent runs; add a new `id` if the scenario changes. Agents under test must not read `answer-key.json` during scoring runs.
