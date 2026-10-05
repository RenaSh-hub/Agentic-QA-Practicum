import type { Locator, Page } from '@playwright/test';
import { duplicateSignupAccountError, signupGuardiansNoticeCopy } from '../test-data/invalid-signup';
import { AppRoute } from '../test-data/routes';

/** Sign-up page. */
export class SignupPage {
  readonly heading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly signUpButton: Locator;
  readonly logIn: Locator;
  readonly terms: Locator;
  readonly privacy: Locator;
  readonly main: Locator;
  readonly guardiansNotice: Locator;
  readonly duplicateAccountError: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Create your account', exact: true });
    this.name = page.getByRole('textbox', { name: 'Your name', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.password = page.getByRole('textbox', { name: 'Password (8+ characters)', exact: true });
    this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    this.logIn = page.getByRole('link', { name: 'Log in', exact: true });
    this.terms = page.getByRole('link', { name: 'Terms of Service', exact: true });
    this.privacy = page.getByRole('link', { name: 'Privacy Policy', exact: true });
    this.main = page.getByRole('main');
    this.guardiansNotice = this.main.getByText(signupGuardiansNoticeCopy);
    this.duplicateAccountError = page.getByText(duplicateSignupAccountError, { exact: true });
  }

  /** Opens the sign-up page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Signup);
  }

  /** Opens sign-up with a `next` query parameter (e.g. `%2Ffriends`). */
  async gotoWithNext(encodedNext: string): Promise<void> {
    await this.page.goto(`${AppRoute.Signup}?next=${encodedNext}`);
  }

  /** Fills the name, email, and password. */
  async fill(name: string, email: string, password: string): Promise<void> {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
  }

  /** Submits the sign-up form. */
  async submit(): Promise<void> {
    await this.signUpButton.click();
  }
}
