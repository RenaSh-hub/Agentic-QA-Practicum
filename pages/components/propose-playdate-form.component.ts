import type { Locator, Page } from '@playwright/test';

/** Propose form on the Playdates page. The date, time, family, and place fields have no accessible name. */
export class ProposePlaydateForm {
  readonly family: Locator;
  readonly familyOptions: Locator;
  readonly placeOptions: Locator;
  readonly date: Locator;
  readonly startTime: Locator;
  readonly endTime: Locator;
  readonly place: Locator;
  readonly locationNote: Locator;
  readonly note: Locator;
  readonly sendRequest: Locator;

  constructor(private readonly page: Page) {
    this.family = page.getByRole('combobox').nth(0);
    this.familyOptions = this.family.getByRole('option');
    this.place = page.getByRole('combobox').nth(1);
    this.placeOptions = this.place.getByRole('option');
    this.date = page.getByRole('textbox').nth(0);
    this.startTime = page.getByRole('textbox').nth(1);
    this.endTime = page.getByRole('textbox').nth(2);
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

  /**
   * Selects a circle family by its visible option label.
   * @param label Visible family name in the combobox.
   */
  async selectFamily(label: string): Promise<void> {
    await this.family.selectOption({ label });
  }

  /**
   * Returns matched-slot buttons by accessible name.
   * @param name Exact accessible name, or a pattern that matches it.
   */
  matchedSlots(name: string | RegExp): Locator {
    const named =
      typeof name === 'string'
        ? this.page.getByRole('button', { name, exact: true })
        : this.page.getByRole('button', { name });
    // Slot buttons include a time range. Banner **Log out** also matches `/ out$/`.
    return named.filter({ hasText: /\d{1,2}:\d{2}(?:am|pm)-/ });
  }

  /**
   * Chooses the first matched slot whose accessible name matches.
   * @param name Exact accessible name, or a pattern that matches it.
   */
  async chooseFirstMatchingSlot(name: string | RegExp): Promise<void> {
    await this.matchedSlots(name).first().click();
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
