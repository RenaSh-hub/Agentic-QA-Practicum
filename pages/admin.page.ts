import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Admin totals and recent sign-ups. */
export class AdminPage {
  readonly header: HeaderComponent;
  readonly refresh: Locator;
  readonly showAsTable: Locator;
  readonly latestSignUps: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.refresh = page.getByRole('button', { name: 'Refresh', exact: true });
    this.showAsTable = page.getByText('Show as table', { exact: true });
    this.latestSignUps = page.getByText('Latest sign-ups', { exact: true });
  }

  /** Opens the admin page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Admin);
  }

  /** Reloads the admin totals. */
  async refreshTotals(): Promise<void> {
    await this.refresh.click();
  }

  /** Activates Show as table on the weekly chart. */
  async openSignUpTable(): Promise<void> {
    await this.showAsTable.click();
  }
}
