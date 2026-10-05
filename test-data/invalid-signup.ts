import {
  SIGNUP_PASSWORD_MIN_LENGTH,
  type SignupAccountPayload,
} from './factories/signup-account.factory';

/** Valid filler when the AC only constrains the email or password under test (AC16–AC20). */
export const invalidSignupValidFiller = {
  name: 'Rena Signup',
  password: '12345678',
} as const;

/** Field sets that must fail sign-up validation per AQPBT-4 negative acceptance criteria. */
export const invalidSignupFieldSets = {
  /** AC3: Given all three fields are empty, When I click Sign up, Then Your name has focus. */
  allFieldsEmpty: {
    name: '',
    email: '',
    password: '',
  },
  /** AC4: Given Your name is filled and Email is `not-an-email`, When I click Sign up, Then Email has focus. */
  emailMissingAt: {
    name: 'Rena Signup',
    email: 'not-an-email',
    password: '',
  },
  /** AC5: Given Your name and Email are filled with a well-formed address and Password (8+ characters) has 7 characters, When I click Sign up, Then Password (8+ characters) has focus. */
  passwordTooShort: {
    name: 'Rena Signup',
    email: 'valid-signup@example.test',
    password: '1'.repeat(SIGNUP_PASSWORD_MIN_LENGTH - 1),
  },
  /** AC16: Email `missing-at.com` — missing `@` validation message. */
  emailMissingAtInDomain: {
    name: invalidSignupValidFiller.name,
    email: 'missing-at.com',
    password: invalidSignupValidFiller.password,
  },
  /** AC17: Email `user@` — incomplete part after `@`. */
  emailIncompleteAfterAt: {
    name: invalidSignupValidFiller.name,
    email: 'user@',
    password: invalidSignupValidFiller.password,
  },
  /** AC18: Email `@example.com` — incomplete part before `@`. */
  emailMissingLocalPart: {
    name: invalidSignupValidFiller.name,
    email: '@example.com',
    password: invalidSignupValidFiller.password,
  },
  /** AC19: Email `spaces @example.com` — space in local part. */
  emailSpaceInLocalPart: {
    name: invalidSignupValidFiller.name,
    email: 'spaces @example.com',
    password: invalidSignupValidFiller.password,
  },
  /** AC20: Email `user@.com` — `.` wrong position in domain. */
  emailDotWrongPosition: {
    name: invalidSignupValidFiller.name,
    email: 'user@.com',
    password: invalidSignupValidFiller.password,
  },
} as const satisfies Record<string, SignupAccountPayload>;

/** AC6: Email `not-an-email` validation message. */
export const invalidSignupEmailValidationMessage =
  "Please include an '@' in the email address. 'not-an-email' is missing an '@'." as const;

/** AC16: Email `missing-at.com` validation message. */
export const invalidSignupEmailMissingAtDomainMessage =
  "Please include an '@' in the email address. 'missing-at.com' is missing an '@'." as const;

/** AC17: Email `user@` validation message. */
export const invalidSignupEmailIncompleteAfterAtMessage =
  "Please enter a part following '@'. 'user@' is incomplete." as const;

/** AC18: Email `@example.com` validation message. */
export const invalidSignupEmailMissingLocalPartMessage =
  "Please enter a part followed by '@'. '@example.com' is incomplete." as const;

/** AC19: Email with space in local part validation message. */
export const invalidSignupEmailSpaceInLocalPartMessage =
  "A part followed by '@' should not contain the symbol ' '." as const;

/** AC20: Email `user@.com` validation message. */
export const invalidSignupEmailDotWrongPositionMessage =
  "'.' is used at a wrong position in '.com'." as const;

/** AC7: Password with 7 characters validation message. */
export const invalidSignupPasswordValidationMessage =
  'Please lengthen this text to 8 characters or more (you are currently using 7 characters).' as const;

/** AC21: Empty required field validation message on **Your name**. */
export const invalidSignupRequiredFieldMessage = 'Please fill out this field.' as const;

/** AC2: 18+ copy in the sign-up `main` region. */
export const signupGuardiansNoticeCopy =
  'BuddyTime is for parents and guardians (18+).' as const;

/** AC9 / AC22: Duplicate email inline error. */
export const duplicateSignupAccountError = 'An account with this email already exists' as const;

/** Confluence: name of only spaces does not trigger the required-field message on Your name. */
export const invalidSignupSpacesOnlyName = '     ' as const;

/**
 * AC9 / AC22: Already-registered email uses `process.env.APP_USER_EMAIL` (Family A) in tests —
 * not a committed address. AC22 applies `signupEmailWithDifferentCase` to that value.
 */
