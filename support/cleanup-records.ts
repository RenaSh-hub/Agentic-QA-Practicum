import {
  createBearerApiContext,
  createFamilyApiContext,
  deleteParentAccount,
  type CleanupResult,
} from './api-client';
import { getParentAuth, resetParentAuthStore } from './parent-auth-store';
import {
  getTrackedRecords,
  replaceTrackedRecords,
  resetTracker,
  TrackedRecordType,
  type TrackedRecord,
  type TrackedRecordType as TrackedRecordTypeName,
} from './record-tracker';

export type TrackedCleanupOptions = {
  dryRun?: boolean;
  type?: TrackedRecordTypeName;
};

export type TrackedCleanupSummary = {
  scope: string;
  found: number;
  deleted: number;
  failed: number;
  alreadyRemoved: number;
  authExpired: boolean;
};

async function deleteTrackedRecord(record: TrackedRecord): Promise<CleanupResult | undefined> {
  if (record.type === TrackedRecordType.Parent) {
    const sidecar = getParentAuth(record.id);
    if (sidecar) {
      const api = await createBearerApiContext(sidecar.token);
      try {
        return await deleteParentAccount(api, sidecar.password, record.id);
      } finally {
        await api.dispose();
      }
    }

    const api = await createFamilyApiContext(record.owner);
    try {
      const password =
        record.owner === 'main'
          ? process.env.APP_USER_PASSWORD
          : process.env.APP_ALT_USER_PASSWORD;
      if (!password) {
        console.warn(
          `Skipped parent ${record.id}: missing password env for owner "${record.owner}"`,
        );
        return {
          type: TrackedRecordType.Parent,
          id: record.id,
          ok: false,
          status: 0,
          message: `missing password env for owner "${record.owner}"`,
        };
      }
      return await deleteParentAccount(api, password, record.id);
    } finally {
      await api.dispose();
    }
  }

  console.warn(`Skipped unknown record type "${record.type}" id ${record.id}`);
  return undefined;
}

function logResult(result: CleanupResult): void {
  if (result.ok) {
    console.log(`Deleted ${result.type} ${result.id}`);
  } else if (result.status === 404) {
    console.log(`Already removed ${result.type} ${result.id}`);
  } else if (result.status === 401) {
    console.warn(
      `Auth expired (401) for ${result.type} ${result.id} — re-run the setup project`,
    );
  } else {
    console.warn(
      `Failed to delete ${result.type} ${result.id}: HTTP ${result.status} — ${result.message}`,
    );
  }
}

function scopeLabel(options: TrackedCleanupOptions, records: TrackedRecord[]): string {
  if (options.type) {
    return `type=${options.type}`;
  }
  if (records.length === 0) {
    return 'all tracked';
  }
  const types = [...new Set(records.map((r) => r.type))];
  return types.length === 1 ? `type=${types[0]}` : 'all tracked';
}

function classifyResult(result: CleanupResult): 'deleted' | 'alreadyRemoved' | 'failed' | 'authExpired' {
  if (result.ok || result.status === 204) {
    return 'deleted';
  }
  if (result.status === 404) {
    return 'alreadyRemoved';
  }
  if (result.status === 401) {
    return 'authExpired';
  }
  return 'failed';
}

/**
 * Deletes tracked rows from `.test-artifacts/created-records.jsonl` using api-client helpers.
 * Only records present in the tracker are targeted — never ad-hoc ids.
 */
export async function cleanupTrackedRecords(
  options: TrackedCleanupOptions = {},
): Promise<TrackedCleanupSummary> {
  const allTracked = getTrackedRecords();
  const records = options.type
    ? allTracked.filter((r) => r.type === options.type)
    : allTracked;

  const summary: TrackedCleanupSummary = {
    scope: scopeLabel(options, records),
    found: records.length,
    deleted: 0,
    failed: 0,
    alreadyRemoved: 0,
    authExpired: false,
  };

  if (options.dryRun) {
    for (const record of records) {
      console.log(`Would delete ${record.type} ${record.id} (owner: ${record.owner})`);
    }
    return summary;
  }

  const remaining: TrackedRecord[] = options.type ? allTracked.filter((r) => r.type !== options.type) : [];

  for (const record of records) {
    const result = await deleteTrackedRecord(record);
    if (!result) {
      summary.failed += 1;
      if (options.type) {
        remaining.push(record);
      }
      continue;
    }
    logResult(result);
    const outcome = classifyResult(result);
    if (outcome === 'deleted') {
      summary.deleted += 1;
    } else if (outcome === 'alreadyRemoved') {
      summary.alreadyRemoved += 1;
    } else if (outcome === 'authExpired') {
      summary.authExpired = true;
      summary.failed += 1;
      if (options.type) {
        remaining.push(record);
      }
    } else {
      summary.failed += 1;
      if (options.type) {
        remaining.push(record);
      }
    }
  }

  if (options.type) {
    replaceTrackedRecords(remaining);
  } else {
    resetTracker();
    resetParentAuthStore();
  }

  return summary;
}

/** Deletes all tracked records, then clears tracker and parent auth sidecar. Idempotent when empty. */
export async function cleanupCreatedRecords(): Promise<void> {
  await cleanupTrackedRecords();
}
