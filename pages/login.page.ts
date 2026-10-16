import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

/** Log-in page. */
export class LoginPage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly logInButton: Locator;
  readonly signUp: Locator;
  readonly forgotPassword: Locator;
  readonly invalidCredentialsError: Locator;
  readonly buddyTime: Locator;
  readonly newToBuddyTime: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Welcome back', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.password = page.getByRole('textbox', { name: 'Password', exact: true });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.signUp = page.getByRole('link', { name: 'Sign up', exact: true });
    this.forgotPassword = page.getByRole('link', { name: 'Forgot password?', exact: true });
    this.invalidCredentialsError = page.getByText('Invalid email or password', { exact: true });
    this.buddyTime = page.getByText('BuddyTime', { exact: true });
    this.newToBuddyTime = page.getByText('New to BuddyTime?');
  }

  /** Opens the log-in page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  /** Opens log-in with a `next` query parameter (e.g. `%2Ffriends`). */
  async gotoWithNext(encodedNext: string): Promise<void> {
    await this.page.goto(`${AppRoute.Login}?next=${encodedNext}`);
  }

  /** Fills the email. */
  async fillEmail(email: string): Promise<void> {
    await this.email.fill(email);
  }

  /** Fills the password. */
  async fillPassword(password: string): Promise<void> {
    await this.password.fill(password);
  }

  /** Submits the log-in form. */
  async submit(): Promise<void> {
    await this.logInButton.click();
  }

  /** Fills credentials and submits the log-in form. */
  async logIn(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Opens the sign-up page. */
  async openSignUp(): Promise<void> {
    await this.signUp.click();
  }

  /** Opens the forgot-password page. */
  async openForgotPassword(): Promise<void> {
    await this.forgotPassword.click();
  }
}
