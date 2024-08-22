import { test, expect } from '@playwright/test';

test('Loads Home', async ({ page }) => {
  await page.goto('/Landing');
  await expect(page).toHaveTitle(/Invasive Species BC/);
  await page
    .locator('div')
    .filter({ hasText: /^InvasivesBCHomeTrainingMap$/ })
    .getByRole('button')
    .click();
  await page.getByRole('menuitem', { name: 'Update My Info' }).click();
});
