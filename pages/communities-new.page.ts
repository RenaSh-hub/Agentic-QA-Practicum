import type { Locator, Page } from '@playwright/test';
import { CreateCommunityForm } from './components/create-community-form.component';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Create a community at /communities/new. */
export class CommunitiesNewPage {
  readonly header: HeaderComponent;
  readonly form: CreateCommunityForm;
  readonly back: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.form = new CreateCommunityForm(page);
    this.back = page.getByRole('link', { name: '← Back to communities', exact: true });
  }

  /** Opens the create-community page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.CreateCommunity);
  }
}
