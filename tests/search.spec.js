// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-08, TC-09, TC-10, TC-11 от qa-docs/TEST_CASES.md
// Използва статичните данни от `parts` в index.html (pos "1" = Axle beam / 3034510410).

test.beforeEach(async ({ page }) => {
  await gotoLoggedIn(page, 'viewer');
});

test('търсене по точен номер на позиция филтрира списъка', async ({ page }) => {
  const rows = page.locator('#catalogTbody .cat-row');
  const totalBefore = await rows.count();
  expect(totalBefore).toBeGreaterThan(1);

  await page.locator('#searchInput').fill('1');
  const filtered = await rows.count();
  expect(filtered).toBeLessThan(totalBefore);
  await expect(page.locator('#row-1')).toBeVisible();
});

test('търсене по описание връща съвпадения по name, не само по номер', async ({ page }) => {
  await page.locator('#searchInput').fill('axle beam');
  await expect(page.locator('#row-1')).toBeVisible();
  const rows = page.locator('#catalogTbody .cat-row');
  await expect(rows).toHaveCount(1);
});

test('несъществуващ термин връща празен резултат', async ({ page }) => {
  await page.locator('#searchInput').fill('не-съществуваща-част-xyz-123');
  await expect(page.locator('#catalogTbody .cat-row')).toHaveCount(0);
  await expect(page.locator('#partsCount')).toHaveText('(0)');
});

test('searchClear изчиства полето и възстановява пълния списък', async ({ page }) => {
  const rows = page.locator('#catalogTbody .cat-row');
  const totalBefore = await rows.count();

  await page.locator('#searchInput').fill('axle');
  await expect(page.locator('#searchClear')).toBeVisible();
  expect(await rows.count()).toBeLessThan(totalBefore);

  await page.locator('#searchClear').click();
  await expect(page.locator('#searchInput')).toHaveValue('');
  await expect(rows).toHaveCount(totalBefore);
  await expect(page.locator('#searchClear')).toBeHidden();
});
