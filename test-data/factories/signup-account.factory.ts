import { faker } from '@faker-js/faker';

/** Payload for the Create your account form (Your name, Email, Password). */
export type SignupAccountPayload = {
  name: string;
  email: string;
  password: string;
};

/** Maximum characters the live **Your name** field accepts (AQPBT-4 AC8; confirmed maxLength=100 on `/signup`). */
export const SIGNUP_NAME_MAX_LENGTH = 100;

/** Minimum characters the live **Password (8+ characters)** field accepts (AQPBT-4 AC5–7; confirmed minLength=8 on `/signup`). */
export const SIGNUP_PASSWORD_MIN_LENGTH = 8;

/** Builds a unique, valid sign-up payload for registering a new account. */
export function signupAccount(overrides: Partial<SignupAccountPayload> = {}): SignupAccountPayload {
  const unique = Date.now();
  const base: SignupAccountPayload = {
    name: `${faker.person.fullName()} ${unique}`.slice(0, SIGNUP_NAME_MAX_LENGTH),
    email: `signup-${unique}@${faker.internet.domainName()}`,
    password: `Valid-${unique}!`,
    ...overrides,
  };
  return base;
}

/** Builds a name longer than the field allows, for truncation checks (AQPBT-4 AC8). */
export function signupNameOverMaxLength(): string {
  const unique = Date.now();
  return `${faker.string.alpha({ length: SIGNUP_NAME_MAX_LENGTH })}${unique}`;
}
