import { test } from "@playwright/test";
import { WelcomePage } from "../pages/WelcomePage";
import { Profile } from "../pages/Profile";

test.describe("Profile Page Test Cases", () => {
  let welcomePage;
  let profile;

  test.beforeEach(async ({ page }) => {
    welcomePage = new WelcomePage(page);
    profile = new Profile(page);

    await welcomePage.launchTheBrowser();
    await welcomePage.loginToApplication("9885060891", "777777");
    await welcomePage.verifyUserLoggedIn();

    await profile.openProfilePage();
  });

  test("Verify profile page is displayed", async () => {
    await profile.verifyProfilePage();
  });

  test("Verify profile information is visible", async () => {
    await profile.verifyProfileInfo();
  });

  test("Verify DID section is visible", async () => {
    await profile.verifyDIDSection();
  });

  test("Verify Refer button is visible", async () => {
    await profile.verifyReferButton();
  });

  test("Verify transaction history section is visible", async () => {
    await profile.verifyTransactionHistory();
  });

  test("Verify View All opens transaction details", async () => {
    await profile.clickTransactionViewAll();
    await profile.verifyTransactionDetails();
  });

  test("Verify logout cancel flow", async () => {
    await profile.clickLogout();
    await profile.clickLogoutCancel();
    // await this.page.waitForTimeout(3000);
    await profile.verifyProfilePage();
  });

  test("Verify logout confirm flow", async () => {
    await profile.clickLogout();
    await profile.confirmLogout();
    await profile.verifyAfterLogoutScreen();
  });
});