// @ts-check
import { test, expect } from '@playwright/test';
import { gotoLoggedIn } from './helpers.js';

// Съответства на TC-22, TC-22a, TC-22b, TC-23, TC-23a от qa-docs/TEST_CASES.md
// Очакваната матрица е изведена от applyUserUI() в index.html (show(id, role === ...)).

/** @type {Record<string, Record<string, boolean>>} */
const EXPECTED = {
  admin:  { btnNotif: true,  btnUsers: true,  btnAudit: true,  btnNewOrder: true,  btnOrders: true,  btnScan: true,  btnSchemes: true },
  editor: { btnNotif: true,  btnUsers: false, btnAudit: true,  btnNewOrder: true,  btnOrders: true,  btnScan: true,  btnSchemes: true },
  tech:   { btnNotif: false, btnUsers: false, btnAudit: false, btnNewOrder: false, btnOrders: true,  btnScan: true,  btnSchemes: false },
  viewer: { btnNotif: false, btnUsers: false, btnAudit: false, btnNewOrder: false, btnOrders: false, btnScan: false, btnSchemes: true },
};

for (const [role, expected] of Object.entries(EXPECTED)) {
  test(`header менюто показва правилните бутони за роля "${role}"`, async ({ page }) => {
    await gotoLoggedIn(page, role);
    // btnOrders е директен header бутон, не изисква отваряне на hamburger менюто
    await (expected.btnOrders
      ? expect(page.locator('#btnOrders')).toBeVisible()
      : expect(page.locator('#btnOrders')).toBeHidden());

    await page.locator('#btnHamburger').click();
    await expect(page.locator('#headerDropdown')).toBeVisible();

    for (const id of ['btnNotif', 'btnUsers', 'btnAudit', 'btnNewOrder', 'btnScan', 'btnSchemes']) {
      const locator = page.locator(`#${id}`);
      if (expected[id]) {
        await expect(locator, `#${id} трябва да е видим за роля ${role}`).toBeVisible();
      } else {
        await expect(locator, `#${id} трябва да е скрит за роля ${role}`).toBeHidden();
      }
    }
  });
}

test('quick logout бутонът е видим само за tech/viewer', async ({ page }) => {
  for (const role of ['admin', 'editor']) {
    await gotoLoggedIn(page, role);
    await expect(page.locator('#btnQuickLogout')).toBeHidden();
  }
  for (const role of ['tech', 'viewer']) {
    await gotoLoggedIn(page, role);
    await page.locator('#btnHamburger').click();
    await expect(page.locator('#btnQuickLogout')).toBeVisible();
  }
});

test('edit/drag/debug инструментите са скрити за viewer и tech', async ({ page }) => {
  for (const role of ['viewer', 'tech']) {
    await gotoLoggedIn(page, role);
    await expect(page.locator('#btnDragMode')).toBeHidden();
    await expect(page.locator('#btnDebug')).toBeHidden();
  }
});

test('edit/drag/debug инструментите остават видими за admin и editor', async ({ page }) => {
  for (const role of ['admin', 'editor']) {
    await gotoLoggedIn(page, role);
    await expect(page.locator('#btnDragMode')).toBeVisible();
    await expect(page.locator('#btnDebug')).toBeVisible();
  }
});
