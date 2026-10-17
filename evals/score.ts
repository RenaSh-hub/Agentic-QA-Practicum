import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Label = 'drift' | 'bug' | 'ambiguous';

const LABELS: readonly Label[] = ['drift', 'bug', 'ambiguous'];

type AnswerKeyEntry = {
  id: string;
  input: string;
  expected: Label;
};

type Prediction = {
  id: string;
  predicted: Label;
  evidence: string;
};

type RunFile = {
  model: string;
  startedAt: string;
  finishedAt: string;
  predictions: Prediction[];
};

type ClassCounts = {
  tp: number;
  fp: number;
  fn: number;
};

function repoRoot(): string {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLabel(value: unknown): value is Label {
  return typeof value === 'string' && (LABELS as readonly string[]).includes(value);
}

function parseLabel(value: unknown, context: string): Label {
  if (!isLabel(value)) {
    throw new Error(`${context}: expected one of ${LABELS.join(', ')}`);
  }
  return value;
}

function parseAnswerKey(raw: unknown): AnswerKeyEntry[] {
  if (!Array.isArray(raw)) {
    throw new Error('answer-key.json must be a JSON array');
  }
  return raw.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`answer-key[${index}] must be an object`);
    }
    const { id, input, expected } = entry;
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error(`answer-key[${index}].id must be a non-empty string`);
    }
    if (typeof input !== 'string') {
      throw new Error(`answer-key[${index}].input must be a string`);
    }
    return {
      id,
      input,
      expected: parseLabel(expected, `answer-key[${index}].expected`),
    };
  });
}

function parseRunFile(raw: unknown, fileLabel: string): RunFile {
  if (!isRecord(raw)) {
    throw new Error(`${fileLabel}: root must be an object`);
  }
  const { model, startedAt, finishedAt, predictions } = raw;
  if (typeof model !== 'string') {
    throw new Error(`${fileLabel}: model must be a string`);
  }
  if (typeof startedAt !== 'string') {
    throw new Error(`${fileLabel}: startedAt must be a string`);
  }
  if (typeof finishedAt !== 'string') {
    throw new Error(`${fileLabel}: finishedAt must be a string`);
  }
  if (!Array.isArray(predictions)) {
    throw new Error(`${fileLabel}: predictions must be an array`);
  }
  const parsedPredictions = predictions.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${fileLabel}.predictions[${index}] must be an object`);
    }
    const { id, predicted, evidence } = item;
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error(`${fileLabel}.predictions[${index}].id must be a non-empty string`);
    }
    if (typeof evidence !== 'string') {
      throw new Error(`${fileLabel}.predictions[${index}].evidence must be a string`);
    }
    return {
      id,
      predicted: parseLabel(predicted, `${fileLabel}.predictions[${index}].predicted`),
      evidence,
    };
  });
  return {
    model,
    startedAt,
    finishedAt,
    predictions: parsedPredictions,
  };
}

function loadRunFiles(runsDir: string): { name: string; run: RunFile }[] {
  if (!fs.existsSync(runsDir)) {
    return [];
  }
  const names = fs
    .readdirSync(runsDir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  return names.map((name) => {
    const fullPath = path.join(runsDir, name);
    const raw: unknown = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return { name, run: parseRunFile(raw, name) };
  });
}

function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return 'n/a';
  }
  return `${((numerator / denominator) * 100).toFixed(1)}% (${numerator}/${denominator})`;
}

function emptyClassCounts(): Record<Label, ClassCounts> {
  return {
    drift: { tp: 0, fp: 0, fn: 0 },
    bug: { tp: 0, fp: 0, fn: 0 },
    ambiguous: { tp: 0, fp: 0, fn: 0 },
  };
}

function main(): void {
  const agent = process.argv[2];
  if (!agent || agent.startsWith('-')) {
    process.stderr.write('Usage: npx tsx evals/score.ts <agent>\n');
    process.exit(1);
  }

  const root = repoRoot();
  const agentDir = path.join(root, 'evals', agent);
  const keyPath = path.join(agentDir, 'answer-key.json');
  const runsDir = path.join(agentDir, 'runs');

  if (!fs.existsSync(keyPath)) {
    process.stderr.write(`Missing answer key: ${keyPath}\n`);
    process.exit(1);
  }

  let answerKey: AnswerKeyEntry[];
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    answerKey = parseAnswerKey(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Invalid answer key: ${message}\n`);
    process.exit(1);
  }

  const expectedById = new Map<string, Label>();
  for (const entry of answerKey) {
    if (expectedById.has(entry.id)) {
      process.stderr.write(`Duplicate id in answer key: ${entry.id}\n`);
      process.exit(1);
    }
    expectedById.set(entry.id, entry.expected);
  }

  let runFiles: { name: string; run: RunFile }[];
  try {
    runFiles = loadRunFiles(runsDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Invalid run file: ${message}\n`);
    process.exit(1);
  }

  if (runFiles.length === 0) {
    process.stderr.write(`No run files in ${runsDir}\n`);
    process.exit(1);
  }

  for (const { name, run } of runFiles) {
    for (const prediction of run.predictions) {
      if (!expectedById.has(prediction.id)) {
        process.stderr.write(
          `${name}: prediction id "${prediction.id}" is not in the answer key\n`,
        );
        process.exit(1);
      }
    }
  }

  const counts = emptyClassCounts();
  let correct = 0;
  let totalPredictions = 0;

  for (const { run } of runFiles) {
    for (const prediction of run.predictions) {
      const expected = expectedById.get(prediction.id);
      if (expected === undefined) {
        continue;
      }
      totalPredictions += 1;
      const predicted = prediction.predicted;
      if (predicted === expected) {
        correct += 1;
        counts[predicted].tp += 1;
      } else {
        counts[predicted].fp += 1;
        counts[expected].fn += 1;
      }
    }
  }

  const falsePositives: Record<Label, number> = {
    drift: counts.drift.fp,
    bug: counts.bug.fp,
    ambiguous: counts.ambiguous.fp,
  };

  let agreementCases = 0;
  for (const entry of answerKey) {
    const labels: Label[] = [];
    let missing = false;
    for (const { run } of runFiles) {
      const match = run.predictions.find((p) => p.id === entry.id);
      if (match === undefined) {
        missing = true;
        break;
      }
      labels.push(match.predicted);
    }
    if (missing) {
      continue;
    }
    const first = labels[0];
    if (labels.every((label) => label === first)) {
      agreementCases += 1;
    }
  }

  const agreementDenominator = answerKey.length;
  process.stdout.write(`Agent: ${agent}\n`);
  process.stdout.write(`Answer key cases: ${answerKey.length}\n`);
  process.stdout.write(`Run files: ${runFiles.length}\n`);
  process.stdout.write(`Scored predictions: ${totalPredictions}\n`);
  process.stdout.write(`Overall accuracy: ${formatRate(correct, totalPredictions)}\n`);
  process.stdout.write('\nPer-class metrics (pooled across runs):\n');
  for (const label of LABELS) {
    const { tp, fp, fn } = counts[label];
    process.stdout.write(
      `  ${label}: precision ${formatRate(tp, tp + fp)}, recall ${formatRate(tp, tp + fn)}, false positives ${falsePositives[label]}\n`,
    );
  }
  process.stdout.write(
    `\nRun agreement (same prediction on every run): ${formatRate(agreementCases, agreementDenominator)}\n`,
  );
  process.stdout.write(
    `  (${agreementCases}/${agreementDenominator} cases; missing id in any run counts as disagreement)\n`,
  );
}

main();
