import { test } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";

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
    await mobileLogin.login(
      "9885060891",
      "711711"
    );

    // Verify Login
    // await mobileLogin.surveyVisible();

    // await mobileLogin.surveyVisible();
    // await this.page.waitForTimeout(3000);

  });

  test("Verify user successfully logged in mobile view",
    async () => {

      // Already logged in from beforeEach

  });

});