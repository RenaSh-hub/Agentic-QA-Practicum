import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Family calendar. */
export class CalendarPage {
  readonly header: HeaderComponent;
  readonly familyCalendar: Locator;
  readonly thisWeek: Locator;
  readonly birthdaysThisMonth: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.familyCalendar = page.getByText('Your family calendar', { exact: true });
    this.thisWeek = page.getByText('This week', { exact: true });
    this.birthdaysThisMonth = page.getByText('Birthdays this month');
  }

  /** Opens the calendar. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Calendar);
  }
}
