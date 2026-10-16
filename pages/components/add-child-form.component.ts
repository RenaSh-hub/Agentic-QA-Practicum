import type { Locator, Page } from '@playwright/test';

/** Add-child form on the dashboard. Avatars: Fox, Dino, Robot, Cat, Penguin, Unicorn, Bear, Bunny, Frog, Owl, Lion, Panda, Whale, Ladybug, Rocket, Ball. */
export class AddChildForm {
  readonly name: Locator;
  readonly birthYear: Locator;
  readonly birthMonth: Locator;
  readonly interests: Locator;
  readonly gender: Locator;
  readonly addChildButton: Locator;
  /** Unnamed `<form>` wrapping add-child; `getByRole('form')` is empty on `/app`. */
  private readonly form: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByRole('textbox', { name: "Child's first name", exact: true });
    this.birthYear = page.getByRole('spinbutton', { name: 'Birth year', exact: true });
    this.birthMonth = page.getByRole('spinbutton', { name: 'Month', exact: true });
    this.interests = page.getByRole('textbox', { name: 'Interests (comma-separated)', exact: true });
    this.gender = page.getByRole('combobox', { name: 'Gender', exact: true });
    this.addChildButton = page.getByRole('button', { name: 'Add child', exact: true });
    this.form = page.locator('form').filter({ has: this.addChildButton });
  }

  /** Returns an avatar button by its accessible name, such as "Fox", scoped to this form. */
  avatar(name: string): Locator {
    return this.form.getByRole('button', { name, exact: true });
  }

  /** Returns an interest chip by its accessible name, such as "+ LEGO", scoped to this form. */
  interest(name: string): Locator {
    return this.form.getByRole('button', { name, exact: true });
  }

  /** Activates an interest chip such as "+ LEGO". */
  async addInterest(name: string): Promise<void> {
    await this.interest(name).click();
  }

  /** Fills the child's name and birth year. */
  async fill(name: string, birthYear: string): Promise<void> {
    await this.name.fill(name);
    await this.birthYear.fill(birthYear);
  }

  /** Submits the add-child form. */
  async submit(): Promise<void> {
    await this.addChildButton.click();
  }
}
