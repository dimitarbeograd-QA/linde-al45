// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-31, TC-32, TC-33 от qa-docs/TEST_CASES.md

test('btnSchemes отваря schemesOverlay със списък на схемите', async ({ page }) => {
  await gotoLoggedIn(page, 'editor');
  await page.locator('#btnHamburger').click();
  await page.locator('#btnSchemes').click();
  await expect(page.locator('#schemesOverlay')).toHaveClass(/open/);
  await expect(page.locator('.scheme-card')).toHaveCount(3);
});

test('избор на различна схема сменя активната диаграма и заглавие', async ({ page }) => {
  await gotoLoggedIn(page, 'editor');
  const titleBefore = await page.locator('#headerTitle').textContent();

  await page.locator('#btnHamburger').click();
  await page.locator('#btnSchemes').click();
  await page.locator('.scheme-card').nth(1).click();

  await expect(page.locator('#schemesOverlay')).not.toHaveClass(/open/);
  const titleAfter = await page.locator('#headerTitle').textContent();
  expect(titleAfter).not.toEqual(titleBefore);
  expect(titleAfter).toContain('386.803.04.01');
});

test('tech роля няма достъп до схеми панела (бутонът не се показва)', async ({ page }) => {
  await gotoLoggedIn(page, 'tech');
  await page.locator('#btnHamburger').click();
  await expect(page.locator('#btnSchemes')).toBeHidden();
});
