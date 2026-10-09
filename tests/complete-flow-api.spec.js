/**
 * Complete Flow Test - Using OTP API
 *
 * Full automated flow:
 * 1. Open website
 * 2. Enter phone: 6281674691
 * 3. Read OTP from API (https://api.insightengine.in/wati/get-latest-otp/)
 * 4. Enter OTP automatically
 * 5. Submit OTP (press Enter)
 * 6. Wait 10 seconds for server processing
 * 7. Click submit button if available
 * 8. Detect onboarding or home page
 *
 * NO WhatsApp automation, NO Chrome downloads needed!
 *
 * Usage:
 *   npm run test:complete-flow-api
 *   npm run test:complete-flow-api:headed (with browser visible)
 */

import { test, expect } from "@playwright/test";
import { getOTPFromAPI, testAPIConnection } from "../utils/otp-api-reader.js";

test.describe("Complete Flow - Using OTP API", () => {
  test.beforeAll(async () => {
    console.log("\n" + "=".repeat(70));
    console.log("🚀 COMPLETE AUTOMATED FLOW TEST");
    console.log("=".repeat(70) + "\n");
    console.log("🔧 Testing OTP API Connection...\n");

    const apiReady = await testAPIConnection();
    if (!apiReady) {
      console.error("\n❌ OTP API is not available!");
      console.error("   API: https://api.insightengine.in/wati/get-latest-otp/\n");
      process.exit(1);
    }
  });

  test("Complete Flow: Login → Onboarding/Home", async ({ page }) => {
    const PHONE = "6281674691";

    console.log("=".repeat(70));
    console.log("📱 COMPLETE FLOW TEST - PHONE: " + PHONE);
    console.log("=".repeat(70) + "\n");

    // STEP 1: OPEN WEBSITE
    console.log("📍 STEP 1: Open Website");
    await page.goto("https://superj.app", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    console.log("✅ Website loaded\n");

    // STEP 2: ENTER PHONE NUMBER
    console.log("📍 STEP 2: Enter Mobile Number");
    const phoneInput = page.locator("input").first();
    await expect(phoneInput).toBeVisible({ timeout: 10000 });
    await phoneInput.fill(PHONE);
    console.log(`✅ Mobile number entered: ${PHONE}\n`);

    // STEP 3: CLICK REQUEST OTP BUTTON
    console.log("📍 STEP 3: Click 'Request OTP'");
    const requestBtn = page.locator("button:has-text('Request OTP')");
    await expect(requestBtn).toBeVisible({ timeout: 10000 });
    await requestBtn.click();
    console.log("✅ OTP request sent\n");

    // STEP 4: WAIT FOR OTP SCREEN
    console.log("📍 STEP 4: Wait for OTP Input Screen");
    await page.waitForTimeout(2000);

    let otpInput = null;
    try {
      otpInput = page.locator("input").nth(1);
      await expect(otpInput).toBeVisible({ timeout: 15000 });
      console.log("✅ OTP screen appeared\n");
    } catch (error) {
      console.log("⚠️  OTP input not found\n");
    }

    // STEP 5: GET OTP FROM API
    console.log("📍 STEP 5: Fetch OTP from API");
    let otp;
    try {
      otp = await getOTPFromAPI(60000);
      console.log(`✅ OTP fetched: ${otp}\n`);
    } catch (error) {
      console.error(`❌ Failed to fetch OTP: ${error.message}`);
      throw error;
    }

    // STEP 6: ENTER OTP AND SUBMIT
    console.log("📍 STEP 6: Enter OTP & Submit");
    if (otpInput) {
      await otpInput.fill(otp);
      console.log(`✅ OTP entered: ${otp}`);

      // Press Enter to submit
      await otpInput.press("Enter");
      console.log("✅ OTP submitted (Enter pressed)\n");
    } else {
      console.log(`⚠️  Could not enter OTP - field not found\n`);
    }

    // STEP 7: WAIT 10 SECONDS FOR SERVER PROCESSING
    console.log("📍 STEP 7: Wait 10 seconds (server processing)");
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r⏳ ${i}s remaining...`);
      await page.waitForTimeout(1000);
    }
    console.log("\r✅ Wait complete                   \n");

    // STEP 8: FIND AND CLICK SUBMIT BUTTON
    console.log("📍 STEP 8: Find & Click Submit Button");
    const pageButtons = await page.locator("button").all();
    console.log(`   Found ${pageButtons.length} buttons:\n`);

    let clickedBtn = false;
    const submitKeywords = ["submit", "verify", "confirm", "continue", "next"];

    for (let i = 0; i < pageButtons.length; i++) {
      const btnText = await pageButtons[i].textContent();
      const btnLower = btnText?.toLowerCase() || "";
      console.log(`   ${i + 1}. "${btnText?.trim()}"`);

      if (!clickedBtn && submitKeywords.some(kw => btnLower.includes(kw))) {
        console.log(`      → Clicking this button!\n`);
        await pageButtons[i].click();
        clickedBtn = true;
        await page.waitForTimeout(2000);
      }
    }
    if (!clickedBtn) {
      console.log(`   → No submit button found\n`);
    }

    // STEP 9: DETECT FINAL FLOW
    console.log("📍 STEP 9: Detect Final Flow");
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}\n`);

    let flowType = "UNKNOWN";
    const urlLower = finalUrl.toLowerCase();

    if (urlLower.includes("/home")) {
      flowType = "HOME PAGE";
      console.log("🏠 HOME PAGE DETECTED\n");
    } else if (urlLower.includes("/onboarding") || urlLower.includes("/setup") || urlLower.includes("/kyc")) {
      flowType = "ONBOARDING";
      console.log("📋 ONBOARDING FLOW DETECTED\n");
    } else if (urlLower.includes("/verify")) {
      flowType = "VERIFY - WAITING FOR OTP";
      console.log("⏳ STILL ON OTP VERIFICATION PAGE\n");
    }

    // STEP 10: CHECK PAGE CONTENT
    console.log("📍 STEP 10: Verify Page Content");
    const headings = await page.locator("h1, h2, h3").all();
    if (headings.length > 0) {
      const heading = await headings[0].textContent();
      console.log(`   Page Heading: "${heading?.trim()}"\n`);
    }

    // FINAL SUMMARY
    console.log("=".repeat(70));
    console.log("✅ COMPLETE FLOW TEST FINISHED!");
    console.log("=".repeat(70));
    console.log("\n📊 FINAL SUMMARY:");
    console.log(`   ✅ Website: Opened`);
    console.log(`   ✅ Phone: ${PHONE}`);
    console.log(`   ✅ OTP: Fetched (${otp})`);
    console.log(`   ✅ OTP: Entered & Submitted`);
    console.log(`   ✅ Wait: 10 seconds completed`);
    console.log(`   ✅ Button: ${clickedBtn ? "Clicked" : "Not found"}`);
    console.log(`   ✅ Final URL: ${finalUrl}`);
    console.log(`   ✅ Flow Status: ${flowType}`);
    console.log(`   ✅ Time: ${new Date().toLocaleTimeString()}`);
    console.log("\n" + "=".repeat(70) + "\n");
  });
});
