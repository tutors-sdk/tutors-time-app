import { test, expect } from '@playwright/test';

test('application loads', async ({ page }) => {
  await page.goto('/');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Tutors Time/);

  // Check that the dialog appears (course ID selection)
  const dialog = page.locator('dialog');
  await expect(dialog).toBeVisible();

  // Check that the AppBar headline is visible
  await expect(page.getByRole('heading', { name: /Calendar Data/i })).toBeVisible();
});
