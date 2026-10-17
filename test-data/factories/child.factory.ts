import type { CreateChildPayload } from '../../support/api-client';

/** Unique child payload matching api/CATALOG.md POST /api/v1/children fields. */
export function catalogChildPayload(overrides: Partial<CreateChildPayload> = {}): CreateChildPayload {
  const unique = Date.now();
  return {
    firstName: `ApiKid${unique}`,
    birthYear: 2018,
    avatarKey: 'fox',
    interests: [],
    ...overrides,
  };
}
