import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Communities the family belongs to. */
export class CommunitiesPage {
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly createGroup: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { name: 'Your communities', exact: true });
    this.createGroup = page.getByRole('link', { name: '+ Create group', exact: true });
  }

  /** Opens the communities page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /** Returns a community link whose accessible name contains `name`. */
  community(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  /** Opens the create-group page. */
  async openCreateGroup(): Promise<void> {
    await this.createGroup.click();
  }
}
