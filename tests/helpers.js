// @ts-check
import { expect } from '@playwright/test';

/** Demo акаунти, seed-нати сървърно при старт (виж server/db.js SEED_USERS). */
const CREDENTIALS = {
  admin:  { username: 'admin',   password: 'admin123' },
  editor: { username: 'editor1', password: 'editor123' },
  tech:   { username: 'tech',    password: 'tech123' },
  viewer: { username: 'viewer1', password: 'viewer123' },
};

/**
 * Логва РЕАЛНО през POST /api/login (page.request споделя browser context-а
 * с page-а, така че httpOnly сесийната бисквитка, която сървърът връща, е
 * налична при следващия page.goto()) — огледално на действителния login
 * flow. Заменя старото директно писане в localStorage['lp_users'] +
 * sessionStorage['lp_session'], което симулираше точно уязвимостта, дето
 * вече е поправена (виж "console bypass" регресионния тест в auth.spec.js).
 *
 * @param {import('@playwright/test').Page} page
 * @param {'admin'|'editor'|'tech'|'viewer'} role
 */
export async function login(page, role) {
  const creds = CREDENTIALS[role];
  if (!creds) throw new Error(`Unknown role: ${role}`);
  const res = await page.request.post('/api/login', { data: creds });
  if (!res.ok()) {
    throw new Error(`Login failed for role "${role}": ${res.status()} ${await res.text()}`);
  }
}

/**
 * Навигира и изчаква приложението да завърши init() (диаграмата да е
 * заредена и badge-а — попълнен), после затваря панелите, които
 * applyUserUI() автоматично отваря за admin/editor (Dashboard) и tech
 * (Orders) — за да тръгват тестовете от чист, предвидим базов екран.
 * Самото auto-open поведение се тества отделно в auth.spec.js.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'admin'|'editor'|'tech'|'viewer'} role
 */
export async function gotoLoggedIn(page, role) {
  await login(page, role);
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

/**
 * Връща сървърния SQLite state (users) към default seed и унищожава
 * текущата сесия — вика POST /api/test/reset (само налично при
 * NODE_ENV=test, виж server/server.js, огледално на muzei-lom). За разлика
 * от старото localStorage-базирано fake state, backend-ът пази реално
 * споделен state между тестовете — извикай това в beforeEach за spec
 * файлове, чиито тестове мутират сървърен state (напр. /api/users или
 * бъдещи auth-свързани endpoint-и), за да останат независими от реда на
 * изпълнение.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 */
export async function resetServerState(request) {
  const res = await request.post('/api/test/reset');
  if (!res.ok()) {
    throw new Error('POST /api/test/reset failed — сървърът стартиран ли е с NODE_ENV=test?');
  }
}
