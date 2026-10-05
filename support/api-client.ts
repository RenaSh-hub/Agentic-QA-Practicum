import { request, type APIRequestContext } from '@playwright/test';
import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import { API_ME } from './api.constants';
import { TrackedRecordType, type RecordOwner, type TrackedRecord } from './record-tracker';

export type CleanupResult = {
  type: TrackedRecord['type'];
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

function requireBaseUrl(): string {
  const baseURL = process.env.APP_URL;
  if (!baseURL) {
    throw new Error('APP_URL must be set');
  }
  return baseURL;
}

function storageStateForOwner(owner: RecordOwner): string {
  return owner === 'main' ? AUTH_FILE : ALT_AUTH_FILE;
}

function passwordForOwner(owner: RecordOwner): string | undefined {
  if (owner === 'main') {
    return process.env.APP_USER_PASSWORD;
  }
  return process.env.APP_ALT_USER_PASSWORD;
}

/**
 * Playwright API context authenticated as the main or alt family (storageState).
 * @param owner - Which saved auth file to load
 */
export async function createFamilyApiContext(owner: RecordOwner): Promise<APIRequestContext> {
  const password = passwordForOwner(owner);
  if (!password) {
    throw new Error(
      owner === 'main'
        ? 'APP_USER_PASSWORD must be set for the main family API context'
        : 'APP_ALT_USER_PASSWORD must be set for the alt family API context',
    );
  }
  return request.newContext({
    baseURL: requireBaseUrl(),
    storageState: storageStateForOwner(owner),
  });
}

/**
 * API context authorized with a Bearer JWT (e.g. after sign-up register).
 * @param bearerToken - JWT from register response or localStorage bt_token
 */
export async function createBearerApiContext(bearerToken: string): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: requireBaseUrl(),
    extraHTTPHeaders: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
}

type RegisterResponseBody = {
  parent?: { id?: string };
  token?: string;
};

type MeDeleteBody = {
  password: string;
};

/**
 * DELETE /api/v1/me — removes the account for the authenticated parent.
 * @param api - Request context with Bearer auth for that parent
 * @param password - Password confirmation required by the API
 * @param id - Parent id for logging / result correlation
 */
export async function deleteParentAccount(
  api: APIRequestContext,
  password: string,
  id: string,
): Promise<CleanupResult> {
  const response = await api.fetch(API_ME, {
    method: 'DELETE',
    data: { password } satisfies MeDeleteBody,
  });
  const ok = response.ok() || response.status() === 204;
  let message = response.statusText();
  if (!ok) {
    try {
      message = await response.text();
    } catch {
      // keep statusText
    }
  }
  return {
    type: TrackedRecordType.Parent,
    id,
    ok,
    status: response.status(),
    message,
  };
}

/** Parses a successful register response for tracking. */
export function parseRegisterResponse(body: unknown): RegisterResponseBody | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  return body as RegisterResponseBody;
}

/** Parses register request JSON for the password field. */
export function parseRegisterRequestPassword(postData: string | null): string | undefined {
  if (!postData) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(postData) as { password?: string };
    return typeof parsed.password === 'string' ? parsed.password : undefined;
  } catch {
    return undefined;
  }
}
