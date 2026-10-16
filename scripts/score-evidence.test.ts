import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(REPO_ROOT, 'scripts', 'evidence-fixtures');
const TSX_CLI = path.join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');

type Decision = 'act' | 'escalate' | 'inconclusive';
type Side = 'drift' | 'bug' | null;

type ScoreResult = {
  decisionId: string;
  decision: Decision;
  side: Side;
  score: number;
  oracle: boolean;
  verified: string[];
  missing: string[];
  contradictions: string[];
  rule: number;
  allowedActions: string[];
};

function decisionIdFor(evidencePath: string): string {
  return createHash('sha256').update(fs.readFileSync(evidencePath)).digest('hex').slice(0, 12);
}

function prepareRerun(fixtureRoot: string, evidencePath: string): void {
  const rerunSrc = path.join(fixtureRoot, 'rerun.json');
  if (!fs.existsSync(rerunSrc)) {
    return;
  }
  const destDir = path.join(fixtureRoot, '.test-artifacts', 'reruns');
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(rerunSrc, path.join(destDir, `${decisionIdFor(evidencePath)}.json`));
}

function runCase(name: string): ScoreResult {
  const fixtureRoot = path.join(FIXTURES, name);
  const evidencePath = path.join(fixtureRoot, 'evidence.json');
  prepareRerun(fixtureRoot, evidencePath);

  const spawned = spawnSync(
    process.execPath,
    [TSX_CLI, 'scripts/score-evidence.ts', evidencePath, '--verify-only', '--root', fixtureRoot],
    { encoding: 'utf8', cwd: REPO_ROOT },
  );

  assert.equal(spawned.status, 0, `${spawned.stderr}\n${spawned.stdout}`);
  const result = JSON.parse(spawned.stdout) as ScoreResult;
  const writtenPath = path.join(
    fixtureRoot,
    '.test-artifacts',
    'decisions',
    `${result.decisionId}.json`,
  );
  assert.equal(fs.existsSync(writtenPath), true, `missing decision file ${writtenPath}`);
  assert.deepEqual(JSON.parse(fs.readFileSync(writtenPath, 'utf8')), result);
  assert.equal(result.decisionId, decisionIdFor(evidencePath));
  return result;
}

describe('score-evidence', () => {
  test('min-act-drift: R1–R4, D1 + D2 → drift 60, act (rule 6)', () => {
    const result = runCase('min-act-drift');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 6);
  });

  test('min-act-bug: R1, R2, R4, B1 + B3 → bug 60, act (rule 6)', () => {
    const result = runCase('min-act-bug');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'bug');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 6);
  });

  test('min-escalate: R1–R4, D1 → drift 40, escalate (rule 7)', () => {
    const result = runCase('min-escalate');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 40);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 7);
  });

  test('missing-required: no R4, D1 + D4 → inconclusive (rule 2)', () => {
    const result = runCase('missing-required');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 2);
    assert.deepEqual(result.missing, ['R4']);
  });

  test('contradiction: R1–R4, D1 + B2 → inconclusive (rule 4)', () => {
    const result = runCase('contradiction');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 4);
    assert.ok(result.contradictions.includes('D1'));
    assert.ok(result.contradictions.includes('B2'));
  });

  test('neutral-oracle: R1–R4, N + D2 + D3 → drift 35, no oracle, escalate (rule 7)', () => {
    const result = runCase('neutral-oracle');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 35);
    assert.equal(result.oracle, false);
    assert.equal(result.rule, 7);
  });

  test('flaky: the saved re-run passed → inconclusive (rule 3)', () => {
    const result = runCase('flaky');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 3);
  });

  test('model-score: the evidence has "confidence": 0.9 → inconclusive (rule 1)', () => {
    const result = runCase('model-score');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 1);
  });
});
