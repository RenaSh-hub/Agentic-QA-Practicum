import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

/** Intro copy uses U+2019 (’) in “we’ll” on the live app. */
export const FORGOT_PASSWORD_INTRO =
  'Enter your email and we\u2019ll send you a reset link.';

/** Forgot-password page. */
export class ForgotPasswordPage {
  readonly heading: Locator;
  readonly introInstructions: Locator;
  readonly email: Locator;
  readonly sendResetLink: Locator;
  readonly backToLogIn: Locator;
  readonly accountExistsMessage: Locator;
  readonly resetLinkOnTheWay: Locator;
  readonly linkExpiresOneHour: Locator;
  readonly checkSpamFolder: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Reset your password', exact: true });
    this.introInstructions = page.getByText(FORGOT_PASSWORD_INTRO, { exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.sendResetLink = page.getByRole('button', { name: 'Send reset link', exact: true });
    this.backToLogIn = page.getByRole('link', { name: '← Back to log in', exact: true });
    this.accountExistsMessage = page.getByText(/If an account exists for/);
    this.resetLinkOnTheWay = page.getByText('a reset link is on its way');
    this.linkExpiresOneHour = page.getByText('The link works once and expires in 1 hour');
    this.checkSpamFolder = page.getByText('check your spam folder too');
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

  /** Enters an email and requests a reset link. */
  async requestResetLink(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.submit();
  }

  /** Locator for the submitted email shown in the confirmation message. */
  confirmationEmailAddress(email: string): Locator {
    return this.page.getByText(email, { exact: true });
  }

  /** Returns to the log-in page. */
  async cancel(): Promise<void> {
    await this.backToLogIn.click();
  }
}
