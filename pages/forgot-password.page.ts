import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

/** Forgot-password page. */
export class ForgotPasswordPage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly sendResetLink: Locator;
  readonly backToLogIn: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Reset your password', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.sendResetLink = page.getByRole('button', { name: 'Send reset link', exact: true });
    this.backToLogIn = page.getByRole('link', { name: '← Back to log in', exact: true });
  }

  /** Opens the forgot-password page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.ForgotPassword);
  }

  /** Fills the email. */
  async fillEmail(email: string): Promise<void> {
    await this.email.fill(email);
  }

  /** Submits the reset form. */
  async submit(): Promise<void> {
    await this.sendResetLink.click();
  }

  /** Returns to the log-in page. */
  async cancel(): Promise<void> {
    await this.backToLogIn.click();
  }
}
