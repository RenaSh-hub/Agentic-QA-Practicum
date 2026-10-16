import { expect, type APIResponse } from '@playwright/test';

/** Status observed without `Authorization` on catalog GET probes (2026-10-16). */
export const CATALOG_UNAUTHENTICATED_STATUS = 401;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertNullOrString(value: unknown): void {
  expect(value === null || typeof value === 'string').toBeTruthy();
}

export function assertNullOrNumber(value: unknown): void {
  expect(value === null || typeof value === 'number').toBeTruthy();
}

export function assertNullOrObject(value: unknown): void {
  expect(value === null || isRecord(value)).toBeTruthy();
}

/** Catalog authenticated GET: HTTP 200 and JSON content type. */
export async function readCatalogGetJson(response: APIResponse): Promise<unknown> {
  expect(response.status()).toBe(200);
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain('application/json');
  return response.json();
}

export function assertFamilyRef(value: unknown): void {
  expect(isRecord(value)).toBeTruthy();
  if (!isRecord(value)) {
    return;
  }
  expect(typeof value.id).toBe('string');
  expect(typeof value.name).toBe('string');
}

export function assertMeChild(value: unknown): void {
  expect(isRecord(value)).toBeTruthy();
  if (!isRecord(value)) {
    return;
  }
  expect(typeof value.id).toBe('string');
  expect(typeof value.firstName).toBe('string');
  expect(typeof value.birthYear).toBe('number');
  assertNullOrNumber(value.birthMonth);
  expect(typeof value.age).toBe('number');
  assertNullOrString(value.gender);
  expect(Array.isArray(value.interests)).toBeTruthy();
  assertNullOrString(value.avatarKey);
}

export function assertMeBody(body: unknown): void {
  expect(isRecord(body)).toBeTruthy();
  if (!isRecord(body)) {
    return;
  }
  expect(isRecord(body.parent)).toBeTruthy();
  expect(isRecord(body.family)).toBeTruthy();
  expect(typeof body.isAdmin).toBe('boolean');
  if (!isRecord(body.parent) || !isRecord(body.family)) {
    return;
  }
  expect(typeof body.parent.id).toBe('string');
  expect(typeof body.parent.email).toBe('string');
  expect(typeof body.parent.name).toBe('string');
  expect(typeof body.parent.displayName).toBe('string');
  assertNullOrString(body.parent.phone);
  expect(typeof body.parent.emailVerified).toBe('boolean');
  expect(typeof body.family.id).toBe('string');
  expect(typeof body.family.name).toBe('string');
  assertNullOrString(body.family.addressText);
  expect(typeof body.family.addressVisibility).toBe('string');
  expect(typeof body.family.tz).toBe('string');
  expect(Array.isArray(body.family.parents)).toBeTruthy();
  expect(Array.isArray(body.family.children)).toBeTruthy();
  if (body.family.children.length > 0) {
    assertMeChild(body.family.children[0]);
  }
}

export function assertConnectionItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) {
    return;
  }
  expect(typeof item.id).toBe('string');
  assertFamilyRef(item.family);
  expect(Array.isArray(item.children)).toBeTruthy();
  expect(Array.isArray(item.communities)).toBeTruthy();
  expect(typeof item.since).toBe('string');
  expect(typeof item.status).toBe('string');
  expect(typeof item.blockedByMe).toBe('boolean');
}

export function assertAvailabilityBody(body: unknown): void {
  expect(isRecord(body)).toBeTruthy();
  if (!isRecord(body)) {
    return;
  }
  expect(Array.isArray(body.rules)).toBeTruthy();
  expect(Array.isArray(body.exceptions)).toBeTruthy();
  if (body.rules.length > 0) {
    const rule = body.rules[0];
    expect(isRecord(rule)).toBeTruthy();
    if (isRecord(rule)) {
      expect(typeof rule.id).toBe('string');
      assertNullOrString(rule.childId);
      expect(typeof rule.weekday).toBe('number');
      expect(typeof rule.startMin).toBe('number');
      expect(typeof rule.endMin).toBe('number');
      expect(typeof rule.hosting).toBe('string');
      expect(typeof rule.noticeHours).toBe('number');
    }
  }
  if (body.exceptions.length > 0) {
    const ex = body.exceptions[0];
    expect(isRecord(ex)).toBeTruthy();
    if (isRecord(ex)) {
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.date).toBe('string');
      expect(typeof ex.kind).toBe('string');
      expect(typeof ex.startMin).toBe('number');
      expect(typeof ex.endMin).toBe('number');
      expect(typeof ex.note).toBe('string');
    }
  }
}

export function assertCommunityListItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) {
    return;
  }
  expect(typeof item.id).toBe('string');
  expect(typeof item.name).toBe('string');
  expect(typeof item.type).toBe('string');
  expect(typeof item.description).toBe('string');
  expect(typeof item.myRole).toBe('string');
  expect(typeof item.myStatus).toBe('string');
  expect(typeof item.familiesCount).toBe('number');
  expect(typeof item.pendingCount).toBe('number');
  expect(typeof item.createdAt).toBe('string');
}

export function assertCommunityDetailBody(body: unknown): void {
  assertCommunityListItem(body);
  if (!isRecord(body)) {
    return;
  }
  expect(Array.isArray(body.members)).toBeTruthy();
  if (body.members.length > 0) {
    const member = body.members[0];
    expect(isRecord(member)).toBeTruthy();
    if (isRecord(member)) {
      expect(typeof member.id).toBe('string');
      assertFamilyRef(member.family);
      expect(typeof member.role).toBe('string');
      expect(typeof member.status).toBe('string');
      expect(Array.isArray(member.children)).toBeTruthy();
      assertNullOrObject(member.connection);
      expect(typeof member.since).toBe('string');
    }
  }
}

export function assertEventItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) {
    return;
  }
  expect(typeof item.id).toBe('string');
  expect(typeof item.kind).toBe('string');
  expect(typeof item.title).toBe('string');
  assertNullOrString(item.childId);
  assertNullOrString(item.childName);
  expect(typeof item.startsAt).toBe('string');
  assertNullOrString(item.endsAt);
  expect(typeof item.venueText).toBe('string');
  expect(typeof item.details).toBe('string');
  expect(typeof item.cardKey).toBe('string');
  expect(typeof item.status).toBe('string');
  assertNullOrString(item.communityId);
  assertNullOrString(item.communityName);
  expect(typeof item.rsvpToken).toBe('string');
  expect(isRecord(item.counts)).toBeTruthy();
  if (isRecord(item.counts)) {
    expect(typeof item.counts.yes).toBe('number');
    expect(typeof item.counts.no).toBe('number');
    expect(typeof item.counts.maybe).toBe('number');
    expect(typeof item.counts.guestsComing).toBe('number');
  }
  expect(typeof item.createdAt).toBe('string');
  expect(typeof item.canManage).toBe('boolean');
}

export function assertMatchItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) {
    return;
  }
  expect(typeof item.date).toBe('string');
  expect(typeof item.startMin).toBe('number');
  expect(typeof item.endMin).toBe('number');
  expect(typeof item.startsAt).toBe('string');
  expect(typeof item.endsAt).toBe('string');
  assertFamilyRef(item.family);
  assertNullOrObject(item.suggestedHost);
  expect(typeof item.locationKind).toBe('string');
}

export function assertPlaydateItem(item: unknown): void {
  expect(isRecord(item)).toBeTruthy();
  if (!isRecord(item)) {
    return;
  }
  expect(typeof item.id).toBe('string');
  expect(typeof item.status).toBe('string');
  expect(typeof item.startsAt).toBe('string');
  expect(typeof item.endsAt).toBe('string');
  expect(typeof item.locationKind).toBe('string');
  assertNullOrString(item.locationText);
  expect(typeof item.notes).toBe('string');
  assertFamilyRef(item.proposerFamily);
  assertFamilyRef(item.inviteeFamily);
  assertFamilyRef(item.otherFamily);
  assertFamilyRef(item.hostFamily);
  expect(Array.isArray(item.children)).toBeTruthy();
  expect(isRecord(item.proposedBy)).toBeTruthy();
  if (isRecord(item.proposedBy)) {
    expect(typeof item.proposedBy.id).toBe('string');
    expect(typeof item.proposedBy.name).toBe('string');
    expect(typeof item.proposedBy.displayName).toBe('string');
  }
  expect(typeof item.respondedAt).toBe('string');
  expect(typeof item.cancelledAt).toBe('string');
  expect(typeof item.googleCalendarUrl).toBe('string');
  expect(typeof item.icsUrl).toBe('string');
  expect(typeof item.canRespond).toBe('boolean');
  expect(typeof item.canCancel).toBe('boolean');
}
