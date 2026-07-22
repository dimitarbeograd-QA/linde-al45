// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-21..TC-24, TC-24b от qa-docs/TEST_CASES.md

test.describe('Логин / изход', () => {
  test('без сесия се показва login екранът с admin/tech бърз вход', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#loginOverlay')).toBeVisible();
    await expect(page.getByRole('button', { name: /Администратор/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Техник/ })).toBeVisible();
  });

  test('грешни credentials показват съобщение за грешка', async ({ page }) => {
    await page.goto('/');
    await page.locator('#loginUser').fill('no_such_user');
    await page.locator('#loginPass').fill('wrong');
    await page.getByRole('button', { name: /Вход/ }).click();
    await expect(page.locator('#loginErr')).toBeVisible();
    await expect(page.locator('#loginErr')).toHaveText('Грешно потребителско име или парола');
    await expect(page.locator('#loginOverlay')).toBeVisible();
  });

  test('бърз вход като admin (quickLogin) логва и отваря Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Администратор/ }).click();
    await expect(page.locator('#loginOverlay')).toBeHidden();
    await expect(page.locator('#userBadge')).toContainText('Администратор');
    await expect(page.locator('#dashOverlay')).toBeVisible({ timeout: 3000 });
  });

  test('бърз вход като tech (quickLogin) логва и отваря Orders панела', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Техник/ }).click();
    await expect(page.locator('#loginOverlay')).toBeHidden();
    await expect(page.locator('#userBadge')).toContainText('Сервизен техник');
    await expect(page.locator('#ordersOverlay')).toBeVisible({ timeout: 3000 });
  });

  test('doLogout прекратява сесията и връща login екрана', async ({ page }) => {
    await gotoLoggedIn(page, 'viewer');
    await page.evaluate(() => window.doLogout());
    await expect(page.locator('#loginOverlay')).toBeVisible();
    // Сесията наистина е изчистена, не само overlay-ят е показан
    const session = await page.evaluate(() => sessionStorage.getItem('lp_session'));
    expect(session).toBeNull();
  });
});
