import { test, expect, trackRecord } from './fixtures';
import { createChild, deleteChild } from '../support/api-client';
import { API_ME } from '../support/api.constants';
import { TrackedRecordType } from '../support/record-tracker';
import { catalogChildPayload } from '../test-data/factories/child.factory';
import { assertMeBody, isRecord, readCatalogGetJson } from './helpers/catalog-response';

test('POST /api/v1/children create appears on GET /api/v1/me then DELETE removes child', { tag: '@api' }, async ({
  mainApi,
}) => {
  const payload = catalogChildPayload();
  const created = await createChild(mainApi, payload);
  trackRecord({ type: TrackedRecordType.Child, id: created.id, owner: 'main' });

  const meBody = await readCatalogGetJson(await mainApi.get(API_ME));
  assertMeBody(meBody);
  expect(isRecord(meBody) && isRecord(meBody.family)).toBeTruthy();
  if (!isRecord(meBody) || !isRecord(meBody.family) || !Array.isArray(meBody.family.children)) {
    return;
  }
  const listed = meBody.family.children.find(
    (child) => isRecord(child) && child.id === created.id && child.firstName === payload.firstName,
  );
  expect(listed).toBeDefined();

  const removed = await deleteChild(mainApi, created.id);
  expect(removed.ok).toBeTruthy();
  expect(removed.status).toBe(204);
});
