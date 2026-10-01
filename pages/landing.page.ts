import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

/** Public landing page. */
export class LandingPage {
  readonly getStarted: Locator;
  readonly logIn: Locator;
  readonly privacy: Locator;
  readonly terms: Locator;
  readonly tagline: Locator;

  constructor(private readonly page: Page) {
    this.getStarted = page.getByRole('link', { name: 'Get started', exact: true });
    this.logIn = page.getByRole('link', { name: 'Log in', exact: true });
    this.privacy = page.getByRole('link', { name: 'Privacy', exact: true });
    this.terms = page.getByRole('link', { name: 'Terms', exact: true });
    this.tagline = page.getByText(
      "See when your kids' friends are free — and book a playdate in three taps.",
      { exact: true },
    );
  }

  /** Opens the landing page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Landing);
  }

  /** Follows Get started. */
  async openGetStarted(): Promise<void> {
    await this.getStarted.click();
  }

  /** Follows Log in. */
  async openLogIn(): Promise<void> {
    await this.logIn.click();
  }
}
