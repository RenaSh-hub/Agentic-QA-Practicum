import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const TRACKER_PATH = path.join('.test-artifacts', 'created-records.jsonl');

export type RecordOwner = 'main' | 'alt';

export const TrackedRecordType = {
  Parent: 'parent',
} as const;

export type TrackedRecordType = (typeof TrackedRecordType)[keyof typeof TrackedRecordType];

export type TrackedRecord = {
  type: TrackedRecordType;
  id: string;
  owner: RecordOwner;
};

function trackerDir(): string {
  return path.dirname(TRACKER_PATH);
}

/** Ensures the tracker file exists and starts empty for a run. */
export function initTracker(): void {
  mkdirSync(trackerDir(), { recursive: true });
  writeFileSync(TRACKER_PATH, '', 'utf8');
}

/** Appends a record unless type+id was already tracked. */
export function trackRecord(record: TrackedRecord): void {
  if (record.id.startsWith('mock-')) {
    return;
  }
  const existing = getTrackedRecords();
  const key = `${record.type}:${record.id}`;
  if (existing.some((r) => `${r.type}:${r.id}` === key)) {
    return;
  }
  mkdirSync(trackerDir(), { recursive: true });
  appendFileSync(TRACKER_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}

/** Returns tracked records, unique by type+id (last write wins). */
export function getTrackedRecords(): TrackedRecord[] {
  try {
    const raw = readFileSync(TRACKER_PATH, 'utf8');
    if (!raw.trim()) {
      return [];
    }
    const byKey = new Map<string, TrackedRecord>();
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const parsed = JSON.parse(trimmed) as TrackedRecord;
      byKey.set(`${parsed.type}:${parsed.id}`, parsed);
    }
    return [...byKey.values()];
  } catch (error) {
    if (isEnoent(error)) {
      return [];
    }
    throw error;
  }
}

/** Clears the tracker file after successful cleanup. */
export function resetTracker(): void {
  mkdirSync(trackerDir(), { recursive: true });
  writeFileSync(TRACKER_PATH, '', 'utf8');
}

/** Replaces tracker contents (e.g. after partial cleanup by type). */
export function replaceTrackedRecords(records: TrackedRecord[]): void {
  mkdirSync(trackerDir(), { recursive: true });
  if (records.length === 0) {
    writeFileSync(TRACKER_PATH, '', 'utf8');
    return;
  }
  writeFileSync(TRACKER_PATH, `${records.map((r) => JSON.stringify(r)).join('\n')}\n`, 'utf8');
}

function isEnoent(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}
