// @ts-check
import { expect } from '@playwright/test';

/** Seed акаунти, огледални на дефолтните в index.html (виж ensureDefaultUsers). */
const SEED_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Администратор', role: 'admin', created: Date.now(), last_login: null },
  { id: 2, username: 'editor1', password: 'editor123', name: 'Редактор', role: 'editor', created: Date.now(), last_login: null },
  { id: 3, username: 'tech', password: 'tech123', name: 'Сервизен техник', role: 'tech', created: Date.now(), last_login: null },
  { id: 4, username: 'viewer1', password: 'viewer123', name: 'Наблюдател', role: 'viewer', created: Date.now(), last_login: null },
];

/**
 * Сийдва localStorage/sessionStorage така, че приложението да зареди вече
 * логнато с дадената роля — огледално на AuthDB (`lp_users`, `lp_session`)
 * в index.html. Използва page.addInitScript, за да е налично storage-а
 * преди да изпълни inline скриптовете на страницата (initAuth() при `load`).
 *
 * @param {import('@playwright/test').Page} page
 * @param {'admin'|'editor'|'tech'|'viewer'} role
 */
export async function seedSession(page, role) {
  const user = SEED_USERS.find(u => u.role === role);
  if (!user) throw new Error(`Unknown role: ${role}`);
  await page.addInitScript(([users, sessionUser]) => {
    localStorage.setItem('lp_users', JSON.stringify(users));
    sessionStorage.setItem('lp_session', JSON.stringify({
      user: { id: sessionUser.id, username: sessionUser.username, name: sessionUser.name, role: sessionUser.role },
      expires: Date.now() + 8 * 3600 * 1000,
    }));
  }, [SEED_USERS, user]);
}

/**
 * Навигира и изчаква приложението да завърши init() (диаграмата да е
 * заредена и badge-а — попълнен), после затваря панелите, които
 * applyUserUI() автоматично отваря за admin/editor (Dashboard) и tech
 * (Orders) — за да тръгват тестовете от чист, предвидим базов екран.
 * Самото auto-open поведение се тества отделно в auth.spec.js.
 */
export async function gotoLoggedIn(page, role) {
  await seedSession(page, role);
  await page.goto('/');
  await page.locator('#userBadge').waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const badge = document.getElementById('userBadge');
    return !!badge && badge.textContent.trim().length > 0;
  });
  if (role === 'admin' || role === 'editor') {
    await expect(page.locator('#dashOverlay')).toBeVisible({ timeout: 3000 });
    await page.evaluate(() => window.closeDashboard());
    await expect(page.locator('#dashOverlay')).toBeHidden();
  } else if (role === 'tech') {
    await expect(page.locator('#ordersOverlay')).toBeVisible({ timeout: 3000 });
    await page.evaluate(() => window.closeOrdersPanel());
    await expect(page.locator('#ordersOverlay')).toBeHidden();
  }
}
