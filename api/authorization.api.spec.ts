import { test, expect, trackRecord } from './fixtures';
import { createChild } from '../support/api-client';
import { API_COMMUNITIES, API_ME, apiChildPath, apiCommunityPath } from '../support/api.constants';
import { TrackedRecordType } from '../support/record-tracker';
import { catalogChildPayload } from '../test-data/factories/child.factory';
import { isRecord, readCatalogGetJson } from './helpers/catalog-response';

function meListsChild(body: unknown, childId: string): boolean {
  if (!isRecord(body) || !isRecord(body.family) || !Array.isArray(body.family.children)) {
    return false;
  }
  return body.family.children.some((child) => isRecord(child) && child.id === childId);
}

test('alt family DELETE of a main family child returns 404 and the child stays on GET /api/v1/me', { tag: '@api' }, async ({
  mainApi,
  altApi,
}) => {
  const created = await createChild(mainApi, catalogChildPayload());
  trackRecord({ type: TrackedRecordType.Child, id: created.id, owner: 'main' });

  const denied = await altApi.delete(apiChildPath(created.id));
  expect(denied.status()).toBe(404);

  const mainMe = await readCatalogGetJson(await mainApi.get(API_ME));
  expect(meListsChild(mainMe, created.id)).toBe(true);

  const altMe = await readCatalogGetJson(await altApi.get(API_ME));
  expect(meListsChild(altMe, created.id)).toBe(false);
});

test('DELETE /api/v1/children/{id} without a token returns 401 and the child stays on GET /api/v1/me', { tag: '@api' }, async ({
  mainApi,
  guestApi,
}) => {
  const created = await createChild(mainApi, catalogChildPayload());
  trackRecord({ type: TrackedRecordType.Child, id: created.id, owner: 'main' });

  const denied = await guestApi.delete(apiChildPath(created.id));
  expect(denied.status()).toBe(401);

  const mainMe = await readCatalogGetJson(await mainApi.get(API_ME));
  expect(meListsChild(mainMe, created.id)).toBe(true);
});

test('GET /api/v1/communities/{id} without a token returns 401 and the child stays on GET /api/v1/me', { tag: '@api' }, async ({
  mainApi,
  guestApi,
}) => {
  const created = await createChild(mainApi, catalogChildPayload());
  trackRecord({ type: TrackedRecordType.Child, id: created.id, owner: 'main' });

  const communities = await readCatalogGetJson(await mainApi.get(API_COMMUNITIES));
  if (!Array.isArray(communities) || communities.length === 0) {
    return;
  }
  const first = communities[0];
  if (!isRecord(first) || typeof first.id !== 'string') {
    return;
  }

  const denied = await guestApi.get(apiCommunityPath(first.id));
  expect(denied.status()).toBe(401);

  const mainMe = await readCatalogGetJson(await mainApi.get(API_ME));
  expect(meListsChild(mainMe, created.id)).toBe(true);
});
