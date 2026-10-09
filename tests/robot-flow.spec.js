import { test, expect } from "@playwright/test";
import { WelcomePage } from "../pages/WelcomePage.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

test("Desktop smoke flow: login, wallet, profile and cancel logout", async ({ page }, testInfo) => {
  const welcome = new WelcomePage(page);
  await welcome.launchTheBrowser();
  await welcome.loginToApplication(PHONE_NUMBER, OTP_CODES);
  await welcome.verifyUserLoggedIn();
  await expect(page).toHaveURL(/\/Home/i);

  await welcome.Sidebar.getByText("Wallet", { exact: true }).click();
  await expect(page.getByText("Wallet balance", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("My Gift Cards", { exact: true })).toBeVisible();

  await welcome.Sidebar.getByText("Profile", { exact: true }).click();
  await expect(page).toHaveURL(/\/profile/i);
  await expect(page.getByText(/^did:zkjm:superj:[0-9a-fA-F]{40}$/)).toBeVisible();
  await expect(page.getByText("Birth Year", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  const cancel = page.getByRole("button", { name: "Cancel", exact: true });
  await expect(cancel).toBeVisible();
  await cancel.click();
  await expect(cancel).not.toBeVisible();
  await expect(page).toHaveURL(/\/profile/i);
  await page.screenshot({ path: testInfo.outputPath("profile-after-cancel.png"), fullPage: true });
});
