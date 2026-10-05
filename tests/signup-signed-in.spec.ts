import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages';
import { HeaderComponent } from '../pages/components/header.component';
import { AppRoute } from '../test-data/routes';

test('signed-in user still sees Create your account on sign-up', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.goto();
  await expect(signup.heading).toBeVisible();
});

test('signed-in session persists after visiting sign-up', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const header = new HeaderComponent(page);
  await signup.goto();
  await page.goto(AppRoute.Dashboard);
  await expect(header.logOut).toBeVisible();
});
