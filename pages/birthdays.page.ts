import type { Page } from '@playwright/test';
import { CreatePartyForm } from './components/create-party-form.component';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Create a birthday party invitation. */
export class BirthdaysPage {
  readonly header: HeaderComponent;
  readonly party: CreatePartyForm;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.party = new CreatePartyForm(page);
  }

  /** Opens the birthdays page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }
}
