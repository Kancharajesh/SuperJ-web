import { test } from "@playwright/test";

import { WelcomePage } from "../pages/WelcomePage.js";
import { Wallet } from "../pages/Wallet.js";

test.describe("Wallet Page Test Cases", () => {

  let welcomePage;
  let wallet;

  test.beforeEach(async ({ page }) => {

    welcomePage = new WelcomePage(page);
    wallet = new Wallet(page);

    await welcomePage.launchTheBrowser();

    await welcomePage.loginToApplication(
      "9885060891",
      "777777"
    );

    await welcomePage.verifyUserLoggedIn();

    await wallet.openWallet();
  });

  test("Verify Wallet page opens and cash balance is visible",
    async () => {

      await wallet.verifyCashBalance();

  });

  test("Verify coupons are visible",
    async () => {

      await wallet.couponsVisible();

  });

});