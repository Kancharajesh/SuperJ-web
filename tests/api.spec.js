import { test, expect } from "@playwright/test";
import { WelcomePage } from "../pages/WelcomePage.js";
import { Wallet } from "../pages/Wallet.js";
import { Profile } from "../pages/Profile.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";
import { attachApiLogger, writeApiReport } from "../utils/apiLogger.js";

// SuperJ's own backend (api.superj.app / app-api.superj.app) encrypts every
// request/response body as { iv, data } — an AES payload — so the response
// bodies captured here are ciphertext, not readable JSON. What this test
// verifies and reports is which endpoints are called, in what order, with
// what HTTP method/status, and how many times.
test.describe("API calls during a full desktop session", () => {
  test("Logs every XHR/fetch call from login through Home, Wallet and Profile", async ({
    page,
  }, testInfo) => {
    const calls = attachApiLogger(page);

    const welcomePage = new WelcomePage(page);
    const wallet = new Wallet(page);
    const profile = new Profile(page);

    await welcomePage.launchTheBrowser();
    await welcomePage.loginToApplication(PHONE_NUMBER, OTP_CODES);
    await welcomePage.verifyUserLoggedIn();

    await wallet.openWallet();
    await page.waitForTimeout(1500);

    await profile.openProfilePage();
    await page.waitForTimeout(1500);

    const outFile = testInfo.outputPath("api-report-desktop.json");
    const summary = writeApiReport(calls, outFile);
    await testInfo.attach("api-report-desktop.json", { path: outFile });

    console.log(`\nCaptured ${calls.length} API calls across ${summary.length} endpoints:`);
    for (const row of summary) {
      console.log(`  [${row.hits}x] ${row.endpoint} -> ${row.statuses.join(",")}`);
    }

    expect(calls.length).toBeGreaterThan(0);
    expect(summary.some((row) => row.endpoint.includes("api.superj.app"))).toBe(true);
  });
});
