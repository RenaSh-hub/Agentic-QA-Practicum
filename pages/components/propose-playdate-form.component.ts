import type { Locator, Page } from '@playwright/test';

/** Propose form on the Playdates page. The date, time, family, and place fields have no accessible name. */
export class ProposePlaydateForm {
  readonly family: Locator;
  readonly date: Locator;
  readonly startTime: Locator;
  readonly endTime: Locator;
  readonly place: Locator;
  readonly locationNote: Locator;
  readonly note: Locator;
  readonly sendRequest: Locator;

  constructor(private readonly page: Page) {
    this.family = page.getByRole('combobox').nth(0);
    this.date = page.getByRole('textbox').nth(0);
    this.startTime = page.getByRole('textbox').nth(1);
    this.endTime = page.getByRole('textbox').nth(2);
    this.place = page.getByRole('combobox').nth(1);
    this.locationNote = page.getByRole('textbox', {
      name: 'Location note, park name, or address',
      exact: true,
    });
    this.note = page.getByRole('textbox', { name: 'Optional note', exact: true });
    this.sendRequest = page.getByRole('button', { name: 'Send request', exact: true });
  }

  /** Returns a child checkbox in the propose form by its accessible name. */
  child(name: string): Locator {
    return this.page.getByRole('checkbox', { name, exact: true });
  }

  /** Selects a matched slot by its accessible name. */
  async chooseSlot(name: string): Promise<void> {
    await this.page.getByRole('button', { name, exact: true }).click();
  }

  /** Fills the location note. */
  async fillLocation(location: string): Promise<void> {
    await this.locationNote.fill(location);
  }

  /** Submits the playdate request. */
  async submit(): Promise<void> {
    await this.sendRequest.click();
  }
}
