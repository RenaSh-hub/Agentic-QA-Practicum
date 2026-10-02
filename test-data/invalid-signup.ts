import type { SignupAccountPayload } from './factories/signup-account.factory';

/** Field sets that must fail sign-up validation per AQPBT-4 negative acceptance criteria. */
export const invalidSignupFieldSets = {
  /** AC3: Given all three fields are empty, When I click Sign up, Then Your name has focus. */
  allFieldsEmpty: {
    name: '', // AC3: empty field
    email: '', // AC3: empty field
    password: '', // AC3: empty field
  },
  /** AC4: Given Your name is filled and Email is `not-an-email`, When I click Sign up, Then Email has focus. */
  emailMissingAt: {
    name: 'Rena Signup', // AC4: filled (value not specified in AC)
    email: 'not-an-email', // AC4 / AC6: literal from acceptance criteria
    password: '', // AC4: not part of Given; left empty so failure is on Email
  },
  /** AC5: Given Your name and Email are filled with a well-formed address and Password (8+ characters) has 7 characters, When I click Sign up, Then Password (8+ characters) has focus. */
  passwordTooShort: {
    name: 'Rena Signup', // AC5: filled (value not specified in AC)
    email: 'valid-signup@example.test', // AC5: well-formed address (illustrative; not the invalid input under test)
    password: '1234567', // AC5 / AC7: exactly 7 characters
  },
} as const satisfies Record<string, SignupAccountPayload>;

/** AC6: Given Email contains `not-an-email`, Then its validation message is `Please include an '@' in the email address. 'not-an-email' is missing an '@'.` */
export const invalidSignupEmailValidationMessage =
  "Please include an '@' in the email address. 'not-an-email' is missing an '@'." as const;

/** AC7: Given Password (8+ characters) contains 7 characters, Then its validation message is `Please lengthen this text to 8 characters or more (you are currently using 7 characters).` */
export const invalidSignupPasswordValidationMessage =
  'Please lengthen this text to 8 characters or more (you are currently using 7 characters).' as const;

/** AC9: Given I enter a name, a password of 8 or more characters, and an email that already has an account, When I click Sign up, Then the text **An account with this email already exists** is visible. */
export const duplicateSignupAccountError = 'An account with this email already exists' as const;

/**
 * AC9 invalid input is an already-registered email (Family A). Tests supply `process.env.APP_USER_EMAIL`
 * with a valid name and password of 8+ characters — not a committed address in this file.
 */
