import dotenv from 'dotenv';
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

dotenv.config();

const TEST_USER = process.env.TEST_USER;
const TEST_USER_PASS = process.env.TEST_USER_PASS;

setup("Test ENV's present", async () => {
  expect(TEST_USER).toBeTruthy();
  expect(TEST_USER_PASS).toBeTruthy();
});

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/home/landing');
  await page
    .locator('div')
    .filter({ hasText: /^InvasivesBCHomeTrainingMap$/ })
    .getByRole('button')
    .click();
  await page.getByRole('menuitem', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'IDIR' }).click();
  await page.locator('#user').fill(TEST_USER!);
  await page.locator('#user').press('Tab');
  await page.getByLabel('Password').fill(TEST_USER_PASS!);
  await page.getByLabel('Password').press('Enter');

  await page.context().storageState({ path: authFile });
});