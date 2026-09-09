import { test } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

test.describe("Mobile Login Test Cases", () => {

  let mobileLogin;

  test.beforeEach(async ({ page }) => {

    mobileLogin = new Mobile_login(page);

    // Mobile View
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    // Launch App
    await mobileLogin.launchApplication();

    // Login Before Every Test
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
  });

  test("Verify user successfully logged in mobile view",
    async () => {

      await mobileLogin.verifyUserLoggedIn();

  });

});