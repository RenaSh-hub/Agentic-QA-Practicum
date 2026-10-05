import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const PARENT_AUTH_PATH = path.join('.test-artifacts', 'parent-auth.jsonl');

export type ParentAuthEntry = {
  id: string;
  token: string;
  password: string;
};

function storeDir(): string {
  return path.dirname(PARENT_AUTH_PATH);
}

/** Persists JWT + password for a parent created via POST /api/v1/auth/register. */
export function trackParentAuth(entry: ParentAuthEntry): void {
  if (entry.id.startsWith('mock-')) {
    return;
  }
  mkdirSync(storeDir(), { recursive: true });
  appendFileSync(PARENT_AUTH_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
}

/** Returns the latest stored credentials for a parent id, if any. */
export function getParentAuth(id: string): ParentAuthEntry | undefined {
  try {
    const raw = readFileSync(PARENT_AUTH_PATH, 'utf8');
    let latest: ParentAuthEntry | undefined;
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const parsed = JSON.parse(trimmed) as ParentAuthEntry;
      if (parsed.id === id) {
        latest = parsed;
      }
    }
    return latest;
  } catch (error) {
    if (isEnoent(error)) {
      return undefined;
    }
    throw error;
  }
}

/** Clears parent auth sidecar after cleanup. */
export function resetParentAuthStore(): void {
  mkdirSync(storeDir(), { recursive: true });
  writeFileSync(PARENT_AUTH_PATH, '', 'utf8');
}

function isEnoent(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}
