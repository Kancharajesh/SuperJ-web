import { test } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";
import { Mobile_wallet } from "../pages/Mobile_wallet.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

test.describe("Mobile Wallet Page Test Cases", () => {
  let mobileLogin;
  let wallet;

  test.beforeEach(async ({ page }) => {
    mobileLogin = new Mobile_login(page);
    wallet = new Mobile_wallet(page);

    await page.setViewportSize({ width: 390, height: 844 });

    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    await wallet.openWallet();
  });

  test("Verify Wallet page opens and cash balance is visible", async () => {
    await wallet.verifyCashBalance();
  });

  test("Verify gift cards are visible", async () => {
    await wallet.verifyGiftCards();
  });

  test("Verify coupons are visible", async () => {
    await wallet.verifyCoupons();
  });
});
