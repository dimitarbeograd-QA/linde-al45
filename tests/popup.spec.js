// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-12, TC-13 от qa-docs/TEST_CASES.md
// Двоен клик върху ред от таблицата (rowAction в buildList) избира частта
// и отваря full-card popup — виж selectPart()/showPopup() в index.html.

test.beforeEach(async ({ page }) => {
  await gotoLoggedIn(page, 'viewer');
});

test('двоен клик върху ред отваря popup с коректни данни за частта', async ({ page }) => {
  await expect(page.locator('#fullCard')).not.toHaveClass(/open/);
  await page.locator('#row-1').dblclick();
  await expect(page.locator('#fullCard')).toHaveClass(/open/);
  await expect(page.locator('#popNum')).toHaveText('1');
  await expect(page.locator('#popName')).toHaveText('Axle beam');
  await expect(page.locator('#popPn')).toHaveText('3034510410');
});

test('затваряне на popup чрез ✕ бутона', async ({ page }) => {
  await page.locator('#row-1').dblclick();
  await expect(page.locator('#fullCard')).toHaveClass(/open/);
  await page.locator('.full-card-close').click();
  await expect(page.locator('#fullCard')).not.toHaveClass(/open/);
});

test('затваряне на popup чрез клик извън картата (fullCardBg)', async ({ page }) => {
  await page.locator('#row-1').dblclick();
  await expect(page.locator('#fullCard')).toHaveClass(/open/);
  await page.locator('#fullCardBg').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('#fullCard')).not.toHaveClass(/open/);
});
