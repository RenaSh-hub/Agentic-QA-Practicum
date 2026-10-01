import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { ProposePlaydateForm } from './components/propose-playdate-form.component';
import { AppRoute } from '../test-data/routes';

/** Find a playdate, pending requests, and past playdates. */
export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly propose: ProposePlaydateForm;
  readonly heading: Locator;
  readonly accept: Locator;
  readonly decline: Locator;
  readonly cancel: Locator;
  readonly googleCalendar: Locator;
  readonly ics: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.propose = new ProposePlaydateForm(page);
    this.heading = page.getByRole('heading', { name: 'Find a playdate', exact: true });
    this.accept = page.getByRole('button', { name: 'Accept', exact: true });
    this.decline = page.getByRole('button', { name: 'Decline', exact: true });
    this.cancel = page.getByRole('button', { name: 'cancel', exact: true });
    this.googleCalendar = page.getByRole('link', { name: 'Google', exact: true });
    this.ics = page.getByRole('button', { name: 'ICS', exact: true });
  }

  /** Opens the playdates page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }
}
