import fs from "fs";
import { test as setup, devices } from "@playwright/test";
import { WelcomePage } from "../../pages/WelcomePage.js";
import { Mobile_login } from "../../pages/Mobile_login.js";
import { PHONE_NUMBER, OTP_CODES } from "../../utils/config.js";
import { DESKTOP_STATE, MOBILE_STATE } from "../../utils/ui.js";

// Logs in once per layout and saves the session, so tests/site reuses it
// instead of requesting a fresh OTP per test (see workers: 1 in the config).
// A saved session keeps working after later logins on the same number.
setup("log in on desktop", async ({ browser }) => {
  if (fs.existsSync(DESKTOP_STATE)) {
    try {
      const context = await browser.newContext({
        ...devices["Desktop Chrome"],
        storageState: DESKTOP_STATE,
      });
      const page = await context.newPage();
      await page.goto("https://superj.app/Home", { waitUntil: "domcontentloaded" });
      const currentUrl = page.url();
      await context.close();
      if (currentUrl.includes("/Home") || !currentUrl.includes("/auth")) {
        console.log("✅ Reusing existing valid desktop session from", DESKTOP_STATE);
        return;
      }
    } catch (err) {
      console.log("Existing desktop session check failed, attempting login...", err.message);
    }
  }

  const context = await browser.newContext({ ...devices["Desktop Chrome"] });
  const page = await context.newPage();
  const welcome = new WelcomePage(page);
  await welcome.launchTheBrowser();
  await welcome.loginToApplication(PHONE_NUMBER, OTP_CODES);
  await welcome.verifyUserLoggedIn();
  await context.storageState({ path: DESKTOP_STATE });
  await context.close();
});

setup("log in on mobile", async ({ browser }) => {
  if (fs.existsSync(MOBILE_STATE)) {
    try {
      const context = await browser.newContext({
        ...devices["Pixel 5"],
        storageState: MOBILE_STATE,
      });
      const page = await context.newPage();
      await page.goto("https://superj.app/Home", { waitUntil: "domcontentloaded" });
      const currentUrl = page.url();
      await context.close();
      if (currentUrl.includes("/Home") || !currentUrl.includes("/auth")) {
        console.log("✅ Reusing existing valid mobile session from", MOBILE_STATE);
        return;
      }
    } catch (err) {
      console.log("Existing mobile session check failed, attempting login...", err.message);
    }
  }

  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();
  const mobile = new Mobile_login(page);
  await mobile.launchApplication();
  await mobile.login(PHONE_NUMBER, OTP_CODES);
  await mobile.verifyUserLoggedIn();
  await context.storageState({ path: MOBILE_STATE });
  await context.close();
});
