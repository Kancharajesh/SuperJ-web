import { test, expect } from "@playwright/test";
import { button, open } from "../../utils/ui.js";

// Desktop Wallet (/rewards). TC-WAL-* in TEST_CASES.md. Nothing here cashes
// out or redeems. Gift-card details hold live voucher codes, so tests
// assert on labels only and never read or log the code/PIN.
const giftCards = (page) => page.getByRole("button", { name: /View Terms & Conditions to Redeem/ });

test.describe("Desktop Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/rewards");
    await expect(page.getByText("Wallet balance", { exact: true })).toBeVisible();
  });

  test("TC-WAL-01 wallet balance shows a rupee amount and matching message", async ({ page }) => {
    const message = page.getByText(/^You have ₹\d+ in your Wallet!/);
    await expect(message).toBeVisible();
    const amount = (await message.innerText()).match(/₹(\d+)/)[1];
    await expect(page.getByText(amount, { exact: true }).first()).toBeVisible();
  });

  test("TC-WAL-02 cash-out rule shows a non-zero minimum once loaded", async ({ page }) => {
    await expect(page.getByText(/minimum of ₹[1-9]\d* wallet balance to cash out/)).toBeVisible();
  });

  test("TC-WAL-03 Cash Out button is shown and enabled (not clicked)", async ({ page }) => {
    await expect(button(page, "Cash Out")).toBeEnabled();
  });

  test("TC-WAL-04 Know more explains how to withdraw", async ({ page }) => {
    await button(page, "Know more").click();
    await expect(page.getByText("How to withdraw your cash?").first()).toBeVisible();
    await expect(page.getByText(/partnered with marketplaces like Amazon and Flipkart/).first()).toBeVisible();
  });

  test("TC-WAL-08 Know more quotes the same minimum as the cash-out rule", async ({ page }) => {
    test.fail(true, "BUG-04: Know more says ₹100 for a gift card; the cash-out rule (and mobile) say ₹250");
    const rule = page.getByText(/minimum of ₹[1-9]\d* wallet balance to cash out/);
    await expect(rule).toBeVisible();
    await button(page, "Know more").click();
    const note = page.getByText(/Note: You need a minimum balance of ₹\d+/).first();
    await expect(note).toBeVisible();
    expect((await note.innerText()).match(/₹(\d+)/)[1]).toBe((await rule.innerText()).match(/₹(\d+)/)[1]);
  });

  test("TC-WAL-05 Sort offers Recently Added and Expiring Soon", async ({ page }) => {
    await button(page, "Sort").click();
    await expect(page.getByRole("button", { name: "Recently Added" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Expiring Soon" })).toBeVisible();
  });

  test("TC-WAL-06 See More reveals more gift cards", async ({ page }) => {
    await expect(giftCards(page).first()).toBeVisible();
    const before = await giftCards(page).count();
    await button(page, "See More").click();
    await expect.poll(() => giftCards(page).count()).toBeGreaterThan(before);
  });

  test("TC-WAL-07 gift card details show expiry and redemption info, and close", async ({ page }) => {
    await giftCards(page).first().click();
    await expect(page.getByText(/^Expiry date:/)).toBeVisible();
    await expect(page.getByText(/^Redemption:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText(/^Expiry date:/)).toBeHidden();
  });
});
