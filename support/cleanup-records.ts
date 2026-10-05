import {
  createBearerApiContext,
  createFamilyApiContext,
  deleteParentAccount,
} from './api-client';
import { getParentAuth, resetParentAuthStore } from './parent-auth-store';
import {
  getTrackedRecords,
  resetTracker,
  TrackedRecordType,
  type TrackedRecord,
} from './record-tracker';

async function deleteTrackedRecord(record: TrackedRecord): Promise<void> {
  if (record.type === TrackedRecordType.Parent) {
    const sidecar = getParentAuth(record.id);
    if (sidecar) {
      const api = await createBearerApiContext(sidecar.token);
      try {
        const result = await deleteParentAccount(api, sidecar.password, record.id);
        logResult(result);
      } finally {
        await api.dispose();
      }
      return;
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
        return;
      }
      const result = await deleteParentAccount(api, password, record.id);
      logResult(result);
    } finally {
      await api.dispose();
    }
    return;
  }

  console.warn(`Skipped unknown record type "${record.type}" id ${record.id}`);
}

function logResult(result: { type: string; id: string; ok: boolean; status: number; message: string }): void {
  if (result.ok) {
    console.log(`Deleted ${result.type} ${result.id}`);
  } else {
    console.warn(
      `Failed to delete ${result.type} ${result.id}: HTTP ${result.status} — ${result.message}`,
    );
  }
}

/** Deletes all tracked records, then clears tracker and parent auth sidecar. Idempotent when empty. */
export async function cleanupCreatedRecords(): Promise<void> {
  const records = getTrackedRecords();
  for (const record of records) {
    await deleteTrackedRecord(record);
  }
  resetTracker();
  resetParentAuthStore();
}
