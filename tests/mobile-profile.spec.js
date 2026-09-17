import { test } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";
import { Mobile_profile } from "../pages/Mobile_profile.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

test.describe("Mobile Profile Page Test Cases", () => {
  let mobileLogin;
  let profile;

  test.beforeEach(async ({ page }) => {
    mobileLogin = new Mobile_login(page);
    profile = new Mobile_profile(page);

    await page.setViewportSize({ width: 390, height: 844 });

    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    await profile.openProfilePage();
  });

  test("Verify profile page is displayed", async () => {
    await profile.verifyProfilePage();
  });

  test("Verify DID banner is visible", async () => {
    await profile.verifyDIDVisible();
  });

  test("Verify Refer a friend button is visible", async () => {
    await profile.verifyReferButton();
  });

  test("Verify personal information section is visible", async () => {
    await profile.verifyPersonalInfo();
  });

  test("Verify My History opens transaction history", async () => {
    await profile.clickHistory();
    await profile.verifyTransactionHistoryPage();
  });

  test("Verify logout cancel flow", async () => {
    await profile.clickLogout();
    await profile.cancelLogout();
    await profile.verifyProfilePage();
  });

  // Skipped like the desktop equivalent: actually confirming logout ends the
  // session for the shared test phone number and would break subsequent
  // tests/runs that depend on it still being logged in.
  test.skip("Verify logout confirm flow", async () => {
    await profile.clickLogout();
    await profile.confirmLogout();
  });
});
