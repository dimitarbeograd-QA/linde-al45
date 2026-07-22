// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-01, TC-02, TC-03 от qa-docs/TEST_CASES.md

function readScale(transform) {
  const m = transform.match(/scale\(([-\d.]+)\)/);
  if (!m) throw new Error(`No scale() found in transform: ${transform}`);
  return parseFloat(m[1]);
}

test.beforeEach(async ({ page }) => {
  await gotoLoggedIn(page, 'viewer');
});

test('btnZoomIn увеличава мащаба на диаграмата', async ({ page }) => {
  const stage = page.locator('#zoomStage');
  const before = readScale(await stage.evaluate(el => el.style.transform));
  await page.locator('#btnZoomIn').click();
  const after = readScale(await stage.evaluate(el => el.style.transform));
  expect(after).toBeGreaterThan(before);
});

test('btnZoomOut намалява мащаба на диаграмата', async ({ page }) => {
  const stage = page.locator('#zoomStage');
  // първо увеличи, за да имаме от какво да намаляваме без да опрем в min clamp
  await page.locator('#btnZoomIn').click();
  await page.locator('#btnZoomIn').click();
  const before = readScale(await stage.evaluate(el => el.style.transform));
  await page.locator('#btnZoomOut').click();
  const after = readScale(await stage.evaluate(el => el.style.transform));
  expect(after).toBeLessThan(before);
});

test('btnZoomFit връща диаграмата към fit-to-screen мащаб', async ({ page }) => {
  const stage = page.locator('#zoomStage');
  // Установяваме baseline чрез изричен клик на Fit (а не чрез имплицитния
  // fit при зареждане), защото layout-ът може леко да се уталожи между
  // първоначалния render и по-късни interactions — сравняваме резултата
  // от два реални btnZoomFit клика, не "load-time fit" срещу "click fit".
  await page.locator('#btnZoomFit').click();
  const fitScale = readScale(await stage.evaluate(el => el.style.transform));
  await page.locator('#btnZoomIn').click();
  await page.locator('#btnZoomIn').click();
  const zoomedScale = readScale(await stage.evaluate(el => el.style.transform));
  expect(zoomedScale).toBeGreaterThan(fitScale);
  await page.locator('#btnZoomFit').click();
  const afterFit = readScale(await stage.evaluate(el => el.style.transform));
  expect(afterFit).toBeCloseTo(fitScale, 2);
});

test('zoom контролите не чупят layout-а при повторни клик-ове (repeated zoom in)', async ({ page }) => {
  for (let i = 0; i < 8; i++) {
    await page.locator('#btnZoomIn').click();
  }
  // Скалата трябва да е clamp-ната до макс 8, не да расте безконтролно/NaN
  const stage = page.locator('#zoomStage');
  const scale = readScale(await stage.evaluate(el => el.style.transform));
  expect(scale).toBeLessThanOrEqual(8);
  expect(Number.isFinite(scale)).toBe(true);
});
