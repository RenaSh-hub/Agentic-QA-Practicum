import { readFileSync } from 'fs';
import { request, type APIRequestContext } from '@playwright/test';
import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import { API_CHILDREN, API_ME } from './api.constants';
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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

/** Reads localStorage `bt_token` from a Playwright storageState file. */
function bearerTokenFromStorageState(storagePath: string): string | undefined {
  try {
    const parsed = asRecord(JSON.parse(readFileSync(storagePath, 'utf8')));
    const origins = parsed?.origins;
    if (!Array.isArray(origins)) {
      return undefined;
    }
    for (const origin of origins) {
      const localStorage = asRecord(origin)?.localStorage;
      if (!Array.isArray(localStorage)) {
        continue;
      }
      for (const entry of localStorage) {
        const item = asRecord(entry);
        if (item?.name === 'bt_token' && typeof item.value === 'string' && item.value.length > 0) {
          return item.value;
        }
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Playwright API context authenticated as the main or alt family (storageState).
 * Sends `Authorization: Bearer` from storageState localStorage `bt_token` when present
 * (BuddyTime keeps the session in localStorage, not cookies).
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
  const storageState = storageStateForOwner(owner);
  const bearerToken = bearerTokenFromStorageState(storageState);
  return request.newContext({
    baseURL: requireBaseUrl(),
    storageState,
    extraHTTPHeaders: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
  });
}

/** @see createFamilyApiContext */
export async function createApiContextForOwner(owner: RecordOwner): Promise<APIRequestContext> {
  return createFamilyApiContext(owner);
}

/** Request context with no Bearer token (catalog unauthenticated probes). */
export async function createUnauthenticatedApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: requireBaseUrl(),
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

export type MeChild = {
  id: string;
  firstName: string;
  age: number;
  gender: string | null;
  interests: string[];
};

export type MeResponse = {
  parent: { displayName: string };
  family: { name: string; children: MeChild[] };
};

export type CreatedChild = MeChild;

function parseMeChild(value: unknown): MeChild | undefined {
  const record = asRecord(value);
  if (
    !record ||
    typeof record.id !== 'string' ||
    typeof record.firstName !== 'string' ||
    typeof record.age !== 'number'
  ) {
    return undefined;
  }
  const interests = Array.isArray(record.interests)
    ? record.interests.filter((item): item is string => typeof item === 'string')
    : [];
  return {
    id: record.id,
    firstName: record.firstName,
    age: record.age,
    gender: typeof record.gender === 'string' ? record.gender : null,
    interests,
  };
}

/** Parses GET /api/v1/me for Family A dashboard assertions. */
export function parseMeResponse(body: unknown): MeResponse | undefined {
  const record = asRecord(body);
  const parent = asRecord(record?.parent);
  const family = asRecord(record?.family);
  if (!parent || typeof parent.displayName !== 'string' || !family || typeof family.name !== 'string') {
    return undefined;
  }
  const rawChildren = Array.isArray(family.children) ? family.children : [];
  const children: MeChild[] = [];
  for (const child of rawChildren) {
    const parsed = parseMeChild(child);
    if (!parsed) {
      return undefined;
    }
    children.push(parsed);
  }
  return {
    parent: { displayName: parent.displayName },
    family: { name: family.name, children },
  };
}

/**
 * GET /api/v1/me — current parent, family name, and children.
 * @param api - Family-authenticated request context
 */
export async function fetchMe(api: APIRequestContext): Promise<MeResponse> {
  const response = await api.get(API_ME);
  if (!response.ok()) {
    throw new Error(`GET ${API_ME} failed: HTTP ${response.status()}`);
  }
  const parsed = parseMeResponse(await response.json());
  if (!parsed) {
    throw new Error(`GET ${API_ME} returned an unexpected body`);
  }
  return parsed;
}

/**
 * POST /api/v1/children — creates a child on the authenticated family.
 * @param api - Family-authenticated request context
 * @param payload - firstName and birthYear as sent by the live add-child client
 */
export type CreateChildPayload = {
  firstName: string;
  birthYear: number;
  avatarKey?: string;
  interests?: string[];
};

export async function createChild(
  api: APIRequestContext,
  payload: CreateChildPayload,
): Promise<CreatedChild> {
  const response = await api.post(API_CHILDREN, {
    data: {
      firstName: payload.firstName,
      birthYear: payload.birthYear,
      avatarKey: payload.avatarKey ?? 'fox',
      interests: payload.interests ?? [],
    },
  });
  if (!response.ok()) {
    let detail = response.statusText();
    try {
      detail = await response.text();
    } catch {
      // keep statusText
    }
    throw new Error(`POST ${API_CHILDREN} failed: HTTP ${response.status()} ${detail}`);
  }
  const parsed = parseMeChild(await response.json());
  if (!parsed) {
    throw new Error(`POST ${API_CHILDREN} returned an unexpected body`);
  }
  return parsed;
}

/**
 * DELETE /api/v1/children/:id — removes a child the test created.
 * @param api - Family-authenticated request context
 * @param id - Child id from the create response
 */
export async function deleteChild(api: APIRequestContext, id: string): Promise<CleanupResult> {
  const response = await api.fetch(`${API_CHILDREN}/${id}`, { method: 'DELETE' });
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
    type: TrackedRecordType.Child,
    id,
    ok,
    status: response.status(),
    message,
  };
}
