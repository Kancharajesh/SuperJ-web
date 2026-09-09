import { test, expect } from "@playwright/test";
import { WelcomePage } from "../pages/WelcomePage.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";

test.describe("SuperJ Welcome/Login Page", () => {
  let welcomePage;

  test.beforeEach(async ({ page }) => {
    welcomePage = new WelcomePage(page);
    await welcomePage.launchTheBrowser();
  });

  test("Verify mobile number input field is visible", async () => {
    await expect(welcomePage.Mobilenumber_inputfiled).toBeVisible();
  });

  test("Verify Request OTP button is visible", async () => {
    await expect(welcomePage.RequestOTP).toBeVisible();
  });

  test("Verify validation message for empty mobile number", async () => {
    await welcomePage.RequestOTP.click();
    await expect(welcomePage.Mobilenumber_validationmessage).toBeVisible();
  });

  test("Verify validation message for invalid mobile number", async () => {
    await welcomePage.Mobilenumber_inputfiled.fill("12345");
    await welcomePage.RequestOTP.click();
    await expect(welcomePage.Mobilenumber_validationmessage).toBeVisible();
  });

  test("Verify login with valid OTP", async () => {
    await welcomePage.loginToApplication(PHONE_NUMBER, OTP_CODES);

    await expect(welcomePage.Sidebar).toBeVisible({ timeout: 15000 });
  });
});