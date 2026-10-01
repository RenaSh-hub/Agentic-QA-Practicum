import type { Locator, Page } from '@playwright/test';

/** Add-child form on the dashboard. Avatars: Fox, Dino, Robot, Cat, Penguin, Unicorn, Bear, Bunny, Frog, Owl, Lion, Panda, Whale, Ladybug, Rocket, Ball. */
export class AddChildForm {
  readonly name: Locator;
  readonly birthYear: Locator;
  readonly birthMonth: Locator;
  readonly interests: Locator;
  readonly gender: Locator;
  readonly addChildButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByRole('textbox', { name: "Child's first name", exact: true });
    this.birthYear = page.getByRole('spinbutton', { name: 'Birth year', exact: true });
    this.birthMonth = page.getByRole('spinbutton', { name: 'Month', exact: true });
    this.interests = page.getByRole('textbox', { name: 'Interests (comma-separated)', exact: true });
    this.gender = page.getByRole('combobox', { name: 'Gender', exact: true });
    this.addChildButton = page.getByRole('button', { name: 'Add child', exact: true });
  }

  /** Returns an avatar button by its accessible name, such as "Fox". */
  avatar(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  /** Returns an interest chip by its accessible name, such as "+ LEGO". */
  interest(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
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
