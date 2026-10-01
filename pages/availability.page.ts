import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** Weekly availability and one-off exceptions. */
export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly weekendAfternoons: Locator;
  readonly addSlot: Locator;
  readonly add: Locator;
  readonly day: Locator;
  readonly startTime: Locator;
  readonly endTime: Locator;
  readonly kid: Locator;
  readonly hosting: Locator;
  readonly notice: Locator;
  readonly remove: Locator;
  readonly save: Locator;
  readonly exceptionDate: Locator;
  readonly exceptionKind: Locator;
  readonly exceptionNote: Locator;
  readonly addExceptionButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { name: 'Set your weekly free time', exact: true });
    this.weekendAfternoons = page.getByRole('button', { name: 'Weekend afternoons', exact: true });
    this.addSlot = page.getByRole('button', { name: '+ Add slot', exact: true });
    this.add = page.getByRole('button', { name: 'add', exact: true });
    this.day = page.getByRole('combobox', { name: 'Day', exact: true });
    this.startTime = page.getByRole('textbox', { name: 'Start time', exact: true });
    this.endTime = page.getByRole('textbox', { name: 'End time', exact: true });
    this.kid = page.getByRole('combobox', { name: 'Kid', exact: true });
    this.hosting = page.getByRole('combobox', { name: 'Hosting', exact: true });
    this.notice = page.getByRole('combobox', { name: 'Notice', exact: true });
    this.remove = page.getByRole('button', { name: 'remove', exact: true });
    this.save = page.getByRole('button', { name: 'Save availability', exact: true });
    this.exceptionDate = page.getByRole('textbox', { name: /^$/ });
    this.exceptionKind = page.getByRole('combobox').filter({
      has: page.getByRole('option', { name: 'Away / closed', exact: true }),
    });
    this.exceptionNote = page.getByRole('textbox', { name: 'Optional note', exact: true });
    this.addExceptionButton = page.getByRole('button', { name: 'Add exception', exact: true });
  }

  /** Opens the availability page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }

  /** Applies the weekend-afternoons preset. */
  async applyWeekendAfternoons(): Promise<void> {
    await this.weekendAfternoons.click();
  }

  /** Adds a weekly slot. */
  async openAddSlot(): Promise<void> {
    await this.addSlot.click();
  }

  /** Saves weekly availability. */
  async submit(): Promise<void> {
    await this.save.click();
  }

  /** Adds a one-off exception from the fields already filled. */
  async addException(): Promise<void> {
    await this.addExceptionButton.click();
  }
}
