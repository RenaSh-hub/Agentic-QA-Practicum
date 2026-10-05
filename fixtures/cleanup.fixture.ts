import { test as base, expect, type Page } from '@playwright/test';
import { API_AUTH_REGISTER } from '../support/api.constants';
import {
  parseRegisterRequestPassword,
  parseRegisterResponse,
} from '../support/api-client';
import { trackParentAuth } from '../support/parent-auth-store';
import {
  trackRecord,
  TrackedRecordType,
  type RecordOwner,
  type TrackedRecord,
} from '../support/record-tracker';

export { expect, trackRecord };
export type { RecordOwner, TrackedRecord };

function registerPathMatches(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    return pathname === API_AUTH_REGISTER || pathname.endsWith(API_AUTH_REGISTER);
  } catch {
    return url.includes(API_AUTH_REGISTER);
  }
}

function defaultOwner(): RecordOwner {
  return 'main';
}

async function handleRegisterResponse(
  responseUrl: string,
  status: number,
  requestPostData: string | null,
  responseBody: unknown,
): Promise<void> {
  if (!registerPathMatches(responseUrl) || status !== 201) {
    return;
  }
  const body = parseRegisterResponse(responseBody);
  const parentId = body?.parent?.id;
  const token = body?.token;
  if (!parentId || parentId.startsWith('mock-')) {
    return;
  }
  const password = parseRegisterRequestPassword(requestPostData);
  trackRecord({
    type: TrackedRecordType.Parent,
    id: parentId,
    owner: defaultOwner(),
  });
  if (token && password) {
    trackParentAuth({ id: parentId, token, password });
  }
}

/** Tracks successful register responses on a page for global teardown. Returns a flush function. */
export function attachRegisterResponseTracking(page: Page): () => Promise<void> {
  const pending: Promise<void>[] = [];
  page.on('response', (response) => {
    pending.push(
      (async () => {
        const request = response.request();
        if (request.method() !== 'POST') {
          return;
        }
        const url = response.url();
        if (!registerPathMatches(url)) {
          return;
        }
        let responseBody: unknown;
        try {
          responseBody = await response.json();
        } catch {
          return;
        }
        await handleRegisterResponse(url, response.status(), request.postData(), responseBody);
      })(),
    );
  });
  return async () => {
    await Promise.all(pending);
  };
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const flush = attachRegisterResponseTracking(page);
    await use(page);
    await flush();
  },
});
