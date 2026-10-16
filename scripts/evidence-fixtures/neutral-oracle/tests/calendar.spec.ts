import { test, expect } from '@playwright/test';

test('AC1 — Signed-in Family A sees the family calendar shell', { tag: '@sanity' }, async ({ page }) => {
  await expect(page.getByText('Your family calendar')).toBeVisible();
});
