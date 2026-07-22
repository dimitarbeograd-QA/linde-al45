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
    // Сесията наистина е прекратена server-side, не само overlay-ят е показан
    // (сесията вече живее в httpOnly cookie + сървърен store, не в
    // sessionStorage, затова проверяваме през реалния /api/session endpoint).
    const session = await page.evaluate(() => fetch('/api/session').then(r => r.json()));
    expect(session.user).toBeNull();
  });
});

// Съответства на регресионния сценарий за уязвимостта, поправена в тази
// версия: преди това ВСЕКИ посетител можеше да отвори DevTools конзолата и
// да изпълни `AuthDB.setSession({id:1,username:'x',name:'x',role:'admin'})`,
// после да презареди страницата — и приложението го третираше като напълно
// автентикиран admin, без нужда от парола (защото цялата сесия/роля живееше
// в client-writable localStorage/sessionStorage). Сега сесията идва изцяло
// от сървъра (httpOnly cookie, /api/session), който клиентският JS не може
// нито да прочете, нито да презапише.
test.describe('Регресия: старият client-side console bypass вече не работи', () => {
  test('форсирана localStorage/sessionStorage "сесия" не дава admin достъп', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#loginOverlay')).toBeVisible();

    // Точната стара атака: ръчно писане в sessionStorage['lp_session']
    // (както правеше старият AuthDB.setSession) + lp_users, симулирайки
    // посетител, опитващ се да си самоодобри admin роля без парола.
    await page.evaluate(() => {
      sessionStorage.setItem('lp_session', JSON.stringify({
        user: { id: 999, username: 'hacker', name: 'Hacker', role: 'admin' },
        expires: Date.now() + 8 * 3600 * 1000,
      }));
      localStorage.setItem('lp_users', JSON.stringify([
        { id: 999, username: 'hacker', password: 'x', name: 'Hacker', role: 'admin', created: Date.now(), last_login: null },
      ]));
    });
    await page.reload();

    // Login екранът трябва да остане — сесията вече не се чете от storage.
    await expect(page.locator('#loginOverlay')).toBeVisible();
    // И админ-only UI (Users панела) не се отключва.
    await expect(page.locator('#btnUsers')).toBeHidden();

    // Самият forgery механизъм е премахнат, не само игнориран —
    // AuthDB.setSession вече изобщо не съществува като метод.
    const setSessionType = await page.evaluate(() => typeof window.AuthDB?.setSession);
    expect(setSessionType).toBe('undefined');

    // Сървърът потвърждава окончателно — няма реална сесия.
    const session = await page.evaluate(() => fetch('/api/session').then(r => r.json()));
    expect(session.user).toBeNull();
  });
});
