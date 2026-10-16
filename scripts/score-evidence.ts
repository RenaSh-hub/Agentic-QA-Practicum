import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RUBRIC_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'config',
  'evidence-rubric.json',
);

const FORBIDDEN_KEYS = new Set(['score', 'confidence', 'weight']);
const GIT_PREFIXES = ['tests/', 'pages/', 'features/'] as const;

type Side = 'drift' | 'bug';
type DecisionName = 'act' | 'escalate' | 'inconclusive';

type WeightedEntry = {
  id: string;
  kind: string;
  side: Side | null;
  weight: number;
  oracle: boolean;
};

type Rubric = {
  required: Record<string, string>;
  weighted: WeightedEntry[];
  thresholds: {
    act: number;
    escalate: number;
  };
};

type EvidenceItem = {
  id: string;
  kind: string;
  artifact: string;
  line?: number;
  excerpt?: string;
};

type Evidence = {
  test: {
    file: string;
    title: string;
  };
  items: EvidenceItem[];
};

type CliOptions = {
  evidencePath: string;
  verifyOnly: boolean;
  root: string | null;
};

type ScoreResult = {
  decisionId: string;
  decision: DecisionName;
  side: Side | null;
  score: number;
  oracle: boolean;
  verified: string[];
  missing: string[];
  contradictions: string[];
  rule: number;
  allowedActions: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasForbiddenField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasForbiddenField);
  }
  if (!isRecord(value)) {
    return false;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      return true;
    }
    if (hasForbiddenField(child)) {
      return true;
    }
  }
  return false;
}

function parseCli(argv: string[]): CliOptions {
  let verifyOnly = false;
  let root: string | null = null;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--verify-only') {
      verifyOnly = true;
      continue;
    }
    if (arg === '--root') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--root requires a directory');
      }
      root = path.resolve(value);
      i += 1;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown flag ${arg}`);
    }
    positional.push(arg);
  }
  if (positional.length !== 1) {
    throw new Error(
      'usage: npx tsx scripts/score-evidence.ts <evidence.json> [--verify-only] [--root <dir>]',
    );
  }
  return { evidencePath: path.resolve(positional[0]), verifyOnly, root };
}

function parseRubric(raw: unknown): Rubric {
  if (
    !isRecord(raw) ||
    !isRecord(raw.required) ||
    !Array.isArray(raw.weighted) ||
    !isRecord(raw.thresholds) ||
    typeof raw.thresholds.act !== 'number' ||
    typeof raw.thresholds.escalate !== 'number'
  ) {
    throw new Error('invalid evidence rubric');
  }
  const required: Record<string, string> = {};
  for (const [id, kind] of Object.entries(raw.required)) {
    if (typeof kind !== 'string') {
      throw new Error(`invalid required kind for ${id}`);
    }
    required[id] = kind;
  }
  const weighted: WeightedEntry[] = raw.weighted.map((entry, index) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      typeof entry.kind !== 'string' ||
      typeof entry.weight !== 'number' ||
      typeof entry.oracle !== 'boolean'
    ) {
      throw new Error(`invalid weighted entry at ${index}`);
    }
    if (entry.side !== 'drift' && entry.side !== 'bug' && entry.side !== null) {
      throw new Error(`invalid side for ${entry.id}`);
    }
    return {
      id: entry.id,
      kind: entry.kind,
      side: entry.side,
      weight: entry.weight,
      oracle: entry.oracle,
    };
  });
  return {
    required,
    weighted,
    thresholds: { act: raw.thresholds.act, escalate: raw.thresholds.escalate },
  };
}

function parseEvidence(raw: unknown): Evidence {
  if (!isRecord(raw) || !isRecord(raw.test) || !Array.isArray(raw.items)) {
    throw new Error('invalid evidence file');
  }
  if (typeof raw.test.file !== 'string' || typeof raw.test.title !== 'string') {
    throw new Error('invalid evidence.test');
  }
  const items: EvidenceItem[] = [];
  for (const item of raw.items) {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.kind !== 'string' ||
      typeof item.artifact !== 'string'
    ) {
      throw new Error('invalid evidence item');
    }
    const parsed: EvidenceItem = {
      id: item.id,
      kind: item.kind,
      artifact: item.artifact,
    };
    if (item.line !== undefined) {
      if (typeof item.line !== 'number') {
        throw new Error(`invalid line for ${item.id}`);
      }
      parsed.line = item.line;
    }
    if (item.excerpt !== undefined) {
      if (typeof item.excerpt !== 'string') {
        throw new Error(`invalid excerpt for ${item.id}`);
      }
      parsed.excerpt = item.excerpt;
    }
    items.push(parsed);
  }
  return {
    test: { file: raw.test.file, title: raw.test.title },
    items,
  };
}

function posixArtifact(artifact: string): string {
  return artifact.replace(/\\/g, '/').replace(/^\.\//, '');
}

function isGitChecked(posix: string): boolean {
  return GIT_PREFIXES.some((prefix) => posix.startsWith(prefix));
}

function readViaGit(posix: string): string | null {
  try {
    return execFileSync('git', ['show', `HEAD:${posix}`], { encoding: 'utf8' });
  } catch {
    return null;
  }
}

function readFileIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readArtifact(artifact: string, root: string | null): string | null {
  const posix = posixArtifact(artifact);
  if (root) {
    return readFileIfExists(path.join(root, artifact));
  }
  if (isGitChecked(posix)) {
    return readViaGit(posix);
  }
  return readFileIfExists(path.resolve(artifact));
}

function expectedKind(item: EvidenceItem, rubric: Rubric): string | null {
  if (Object.prototype.hasOwnProperty.call(rubric.required, item.id)) {
    return rubric.required[item.id];
  }
  const weighted = rubric.weighted.find((entry) => entry.id === item.id);
  return weighted ? weighted.kind : null;
}

function verifyItem(item: EvidenceItem, rubric: Rubric, root: string | null): boolean {
  const kind = expectedKind(item, rubric);
  if (kind !== null && kind !== item.kind) {
    return false;
  }
  const text = readArtifact(item.artifact, root);
  if (text === null) {
    return false;
  }
  if (item.line === undefined || item.excerpt === undefined) {
    return false;
  }
  if (item.excerpt.length < 8) {
    return false;
  }
  const lineText = text.split(/\r?\n/)[item.line - 1];
  return lineText !== undefined && lineText.includes(item.excerpt);
}

function firstErrorLineFrom(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = firstErrorLineFrom(child);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }
  if (!isRecord(value)) {
    return null;
  }
  if (isRecord(value.error) && typeof value.error.message === 'string') {
    return value.error.message.split(/\r?\n/)[0] ?? '';
  }
  if (Array.isArray(value.errors)) {
    for (const err of value.errors) {
      if (isRecord(err) && typeof err.message === 'string') {
        return err.message.split(/\r?\n/)[0] ?? '';
      }
    }
  }
  for (const key of ['results', 'tests', 'specs', 'suites'] as const) {
    if (key in value) {
      const found = firstErrorLineFrom(value[key]);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
}

function reportPassed(report: unknown): boolean {
  if (isRecord(report) && isRecord(report.stats) && typeof report.stats.unexpected === 'number') {
    const flaky = typeof report.stats.flaky === 'number' ? report.stats.flaky : 0;
    return report.stats.unexpected === 0 && flaky === 0;
  }
  return firstErrorLineFrom(report) === null;
}

function parseJsonFile(filePath: string): unknown | null {
  const text = readFileIfExists(filePath);
  if (text === null) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractJson(stdout: string): unknown | null {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return null;
  }
  try {
    return JSON.parse(stdout.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function rerunReportPath(decisionId: string, root: string | null): string {
  return path.join(root ?? process.cwd(), '.test-artifacts', 'reruns', `${decisionId}.json`);
}

function captureRerun(testFile: string, title: string, dest: string): unknown | null {
  const spawned = spawnSync(
    'npx',
    ['playwright', 'test', testFile, '-g', title, '--reporter=json'],
    {
      encoding: 'utf8',
      shell: true,
      maxBuffer: 32 * 1024 * 1024,
    },
  );
  const parsed = extractJson(spawned.stdout ?? '');
  if (parsed === null) {
    return null;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(parsed, null, 2)}\n`);
  return parsed;
}

function allowedActions(decision: DecisionName, side: Side | null): string[] {
  if (decision === 'act' && side === 'drift') {
    return ['self-heal'];
  }
  if (decision === 'act' && side === 'bug') {
    return ['bug-reporter'];
  }
  if (decision === 'escalate') {
    return ['escalate'];
  }
  return [];
}

function requiredIds(rubric: Rubric, driftPresent: boolean): string[] {
  return driftPresent ? ['R1', 'R2', 'R3', 'R4'] : ['R1', 'R2', 'R4'];
}

function finish(
  base: Omit<ScoreResult, 'allowedActions'>,
): ScoreResult {
  return {
    ...base,
    allowedActions: allowedActions(base.decision, base.side),
  };
}

function score(
  rubric: Rubric,
  evidence: Evidence,
  raw: unknown,
  decisionId: string,
  cli: CliOptions,
): ScoreResult {
  const weightedById = new Map(rubric.weighted.map((entry) => [entry.id, entry]));
  const verified: string[] = [];
  const verifiedItems = new Map<string, EvidenceItem>();

  for (const item of evidence.items) {
    if (verifyItem(item, rubric, cli.root)) {
      verified.push(item.id);
      verifiedItems.set(item.id, item);
    }
  }

  let rerunPassed = false;
  const r4 = evidence.items.find((item) => item.id === 'R4');
  if (r4 && verifiedItems.has('R4')) {
    const dest = rerunReportPath(decisionId, cli.root);
    const report = cli.verifyOnly
      ? parseJsonFile(dest)
      : captureRerun(evidence.test.file, evidence.test.title, dest);
    if (report === null) {
      const index = verified.indexOf('R4');
      if (index >= 0) {
        verified.splice(index, 1);
      }
      verifiedItems.delete('R4');
    } else if (reportPassed(report)) {
      rerunPassed = true;
    } else {
      const r1 = evidence.items.find((item) => item.id === 'R1');
      const errorLine = firstErrorLineFrom(report);
      if (
        r1?.excerpt === undefined ||
        errorLine === null ||
        !errorLine.includes(r1.excerpt)
      ) {
        const index = verified.indexOf('R4');
        if (index >= 0) {
          verified.splice(index, 1);
        }
        verifiedItems.delete('R4');
      }
    }
  }

  const verifiedWeighted: WeightedEntry[] = [];
  for (const id of verified) {
    const item = verifiedItems.get(id);
    const entry = weightedById.get(id);
    if (!item || !entry || entry.kind !== item.kind) {
      continue;
    }
    verifiedWeighted.push(entry);
  }

  const driftEntries = verifiedWeighted.filter((entry) => entry.side === 'drift');
  const bugEntries = verifiedWeighted.filter((entry) => entry.side === 'bug');
  const missing = requiredIds(rubric, driftEntries.length > 0).filter(
    (id) => !verifiedItems.has(id),
  );

  const empty = {
    decisionId,
    verified,
    missing,
    contradictions: [] as string[],
    oracle: false,
    score: 0,
    side: null as Side | null,
  };

  if (hasForbiddenField(raw)) {
    return finish({ ...empty, decision: 'inconclusive', rule: 1 });
  }
  if (missing.length > 0) {
    return finish({ ...empty, decision: 'inconclusive', rule: 2 });
  }
  if (rerunPassed) {
    return finish({ ...empty, decision: 'inconclusive', rule: 3 });
  }
  if (driftEntries.length > 0 && bugEntries.length > 0) {
    return finish({
      ...empty,
      contradictions: [
        ...driftEntries.map((entry) => entry.id),
        ...bugEntries.map((entry) => entry.id),
      ],
      decision: 'inconclusive',
      rule: 4,
    });
  }

  const side: Side | null =
    driftEntries.length > 0 ? 'drift' : bugEntries.length > 0 ? 'bug' : null;
  const scored = side === 'drift' ? driftEntries : side === 'bug' ? bugEntries : [];
  const total = scored.reduce((sum, entry) => sum + entry.weight, 0);
  const oracle = scored.some((entry) => entry.oracle);

  if (total === 0) {
    return finish({ ...empty, decision: 'inconclusive', rule: 5 });
  }
  if (total >= rubric.thresholds.act && oracle) {
    return finish({
      ...empty,
      decision: 'act',
      side,
      score: total,
      oracle: true,
      rule: 6,
    });
  }
  if (total >= rubric.thresholds.escalate) {
    return finish({
      ...empty,
      decision: 'escalate',
      side,
      score: total,
      oracle,
      rule: 7,
    });
  }
  return finish({
    ...empty,
    decision: 'inconclusive',
    side,
    score: total,
    oracle,
    rule: 8,
  });
}

function writeDecision(result: ScoreResult, root: string | null): void {
  const dir = path.join(root ?? process.cwd(), '.test-artifacts', 'decisions');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${result.decisionId}.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
}

function main(): void {
  const cli = parseCli(process.argv.slice(2));
  const rubric = parseRubric(JSON.parse(fs.readFileSync(RUBRIC_PATH, 'utf8')) as unknown);
  const evidenceBytes = fs.readFileSync(cli.evidencePath);
  const decisionId = createHash('sha256').update(evidenceBytes).digest('hex').slice(0, 12);
  const raw: unknown = JSON.parse(evidenceBytes.toString('utf8'));
  const evidence = parseEvidence(raw);
  const result = score(rubric, evidence, raw, decisionId, cli);
  writeDecision(result, cli.root);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
