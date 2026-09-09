import { test, expect } from "@playwright/test";
import { Mobile_login } from "../pages/Mobile_login.js";
import { PHONE_NUMBER, OTP_CODES } from "../utils/config.js";
import { attachApiLogger, writeApiReport } from "../utils/apiLogger.js";

// Same encryption note as tests/api.spec.js: SuperJ's API wraps every
// payload in { iv, data } (AES ciphertext), so this reports endpoints,
// methods and status codes rather than readable request/response JSON.
test.describe("API calls during a full mobile-web session", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test("Logs every XHR/fetch call from the mobile Start Now -> OTP -> Home flow", async ({
    page,
  }, testInfo) => {
    const calls = attachApiLogger(page);

    const mobileLogin = new Mobile_login(page);
    await mobileLogin.launchApplication();
    await mobileLogin.login(PHONE_NUMBER, OTP_CODES);
    await mobileLogin.verifyUserLoggedIn();

    await page.waitForTimeout(1500);

    const outFile = testInfo.outputPath("api-report-mobile.json");
    const summary = writeApiReport(calls, outFile);
    await testInfo.attach("api-report-mobile.json", { path: outFile });

    console.log(`\nCaptured ${calls.length} API calls across ${summary.length} endpoints:`);
    for (const row of summary) {
      console.log(`  [${row.hits}x] ${row.endpoint} -> ${row.statuses.join(",")}`);
    }

    expect(calls.length).toBeGreaterThan(0);
    expect(summary.some((row) => row.endpoint.includes("api.superj.app"))).toBe(true);
  });
});
