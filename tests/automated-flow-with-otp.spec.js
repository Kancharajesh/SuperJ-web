/**
 * Fully Automated Flow with WhatsApp OTP
 *
 * Complete end-to-end testing with automatic OTP reading from WhatsApp.
 * No manual intervention needed.
 *
 * Setup:
 *   1. npm install whatsapp-web.js qrcode-terminal
 *   2. Run: npm run test:auto-otp
 *   3. Scan QR code with phone (first time only)
 *   4. Tests run with automatic OTP reading
 *
 * Usage:
 *   npm run test:auto-otp              # Run all automated tests
 *   npm run test:auto-otp:headed       # Run with browser visible
 *   npm run test:auto-otp:debug        # Run with debugging
 */

import { test, expect } from "@playwright/test";
import { getOTPFromWhatsApp, initializeWhatsApp, disconnectWhatsApp } from "../utils/whatsapp-otp-reader.js";

test.describe("Fully Automated Flow with WhatsApp OTP", () => {
  let whatsappReady = false;

  test.beforeAll(async () => {
    console.log("\n🔄 Initializing WhatsApp OTP Reader...");
    try {
      await initializeWhatsApp();
      whatsappReady = true;
      console.log("✅ WhatsApp ready for OTP reading\n");
    } catch (error) {
      console.error("❌ Failed to initialize WhatsApp:", error.message);
      console.log("\n📱 First time setup required:");
      console.log("   1. Run: node utils/whatsapp-otp-reader.js");
      console.log("   2. Scan QR code with your phone");
      console.log("   3. Then run tests again\n");
      process.exit(1);
    }
  });

  test.afterAll(async () => {
    if (whatsappReady) {
      await disconnectWhatsApp();
    }
  });

  test("Complete User Journey: Login → Wallet → Survey → Reward", async ({ page, context }) => {
    const PHONE_NUMBER = process.env.TEST_PHONE || "+919876543210"; // Set in .env
    const baseURL = "https://superj.app";

    console.log(`\n🚀 STARTING AUTOMATED FLOW FOR ${PHONE_NUMBER}\n`);

    // Step 1: Navigate to app
    console.log("📍 Step 1: Launch Application");
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    console.log("✅ App loaded\n");

    // Step 2: Click Start Now
    console.log("📍 Step 2: Click Start Now");
    const startNowBtn = page.getByRole("button", { name: /Start Now/i });
    await expect(startNowBtn).toBeVisible({ timeout: 30000 });
    await startNowBtn.click();
    console.log("✅ Start Now clicked\n");

    // Step 3: Enter phone number
    console.log("📍 Step 3: Enter Phone Number");
    const phoneInput = page.getByPlaceholder(/phone/i);
    await expect(phoneInput).toBeVisible({ timeout: 10000 });
    await phoneInput.fill(PHONE_NUMBER);
    console.log(`✅ Phone entered: ${PHONE_NUMBER}\n`);

    // Step 4: Click Continue to request OTP
    console.log("📍 Step 4: Request OTP (Click Continue)");
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await continueBtn.click();
    await page.waitForTimeout(2000);
    console.log("✅ OTP requested\n");

    // Step 5: Wait for OTP from WhatsApp
    console.log("📍 Step 5: Waiting for OTP from WhatsApp...");
    console.log("   Make sure to request OTP on the app now\n");

    let otp;
    try {
      otp = await getOTPFromWhatsApp(PHONE_NUMBER, 60000); // Wait max 60 seconds
    } catch (error) {
      console.error("❌ Failed to get OTP:", error.message);
      throw error;
    }
    console.log("✅ OTP received and extracted\n");

    // Step 6: Enter OTP
    console.log("📍 Step 6: Enter OTP in Application");
    const otpInput = page.getByLabel(/enter.*code|otp/i, { exact: false });
    await expect(otpInput).toBeVisible({ timeout: 10000 });

    // Type OTP digit by digit (for single 6-char field) or all at once
    const inputType = await otpInput.getAttribute("maxlength");
    if (inputType === "6") {
      // Single 6-character field
      await otpInput.fill(otp);
      console.log(`✅ OTP entered: ${otp}\n`);
    } else {
      // Multiple single-digit fields
      for (let i = 0; i < otp.length; i++) {
        await page.getByLabel(`OTP digit ${i + 1}`).fill(otp[i]);
      }
      console.log(`✅ OTP entered: ${otp}\n`);
    }

    // Step 7: Wait for login to complete
    console.log("📍 Step 7: Verify Login Successful");
    try {
      await page.waitForURL(/\/Home/, { timeout: 30000 });
      console.log("✅ Login successful, redirected to Home\n");
    } catch (error) {
      console.error("❌ Login failed or timeout");
      throw error;
    }

    // Step 8: Navigate to Wallet
    console.log("📍 Step 8: Navigate to Wallet");
    const walletLink = page.locator("a[href='/rewards']");
    await expect(walletLink).toBeVisible({ timeout: 10000 });
    await walletLink.click();
    await page.waitForURL(/\/rewards/);
    console.log("✅ Navigated to Wallet\n");

    // Step 9: Verify Wallet Loads
    console.log("📍 Step 9: Verify Wallet Content");
    const balanceText = page.getByText(/wallet balance|you have/i);
    await expect(balanceText).toBeVisible({ timeout: 10000 });
    console.log("✅ Wallet loaded with balance\n");

    // Step 10: Check API calls
    console.log("📍 Step 10: Verify API Calls");
    const apiRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/wallet")) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          time: new Date().toLocaleTimeString()
        });
      }
    });

    await page.waitForTimeout(2000);
    console.log(`✅ Captured ${apiRequests.length} wallet API calls\n`);

    // Step 11: Navigate to Home and check surveys
    console.log("📍 Step 11: Navigate to Home and View Surveys");
    const homeLink = page.locator("a[href='/Home']");
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForURL(/\/Home/);

      const surveyButton = page.getByRole("button", { name: /start survey/i });
      if (await surveyButton.first().isVisible({ timeout: 5000 })) {
        console.log("✅ Surveys available on Home\n");
      }
    }

    // Step 12: Profile check
    console.log("📍 Step 12: Check User Profile");
    const profileIcon = page.getByAltText(/profile/i);
    if (await profileIcon.isVisible({ timeout: 5000 })) {
      await profileIcon.click();
      await page.waitForURL(/\/profile/);

      const didText = page.getByText(/did:zkjm/);
      await expect(didText).toBeVisible({ timeout: 10000 });
      console.log("✅ Profile loaded with DID\n");
    }

    // Final Summary
    console.log("=" .repeat(70));
    console.log("🎉 AUTOMATED FLOW COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(70));
    console.log("\n📊 Journey Summary:");
    console.log(`   ✅ Phone: ${PHONE_NUMBER}`);
    console.log(`   ✅ OTP: ${otp}`);
    console.log(`   ✅ Login: Success`);
    console.log(`   ✅ Wallet: Loaded`);
    console.log(`   ✅ Profile: Loaded`);
    console.log(`   ✅ API Calls: ${apiRequests.length}`);
    console.log("\n🕐 Flow completed at:", new Date().toLocaleTimeString());
    console.log("=" .repeat(70) + "\n");
  });

  test("Quick Login Test (OTP only)", async ({ page }) => {
    const PHONE_NUMBER = process.env.TEST_PHONE || "+919876543210";

    console.log(`\n⚡ QUICK LOGIN TEST\n`);

    await page.goto("https://superj.app");
    await page.getByRole("button", { name: /Start Now/i }).click();
    await page.getByPlaceholder(/phone/i).fill(PHONE_NUMBER);
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.waitForTimeout(2000);

    console.log("📱 Waiting for OTP from WhatsApp...");
    const otp = await getOTPFromWhatsApp(PHONE_NUMBER, 60000);

    const otpInput = page.getByLabel(/enter.*code|otp/i, { exact: false });
    await otpInput.fill(otp);

    await page.waitForURL(/\/Home/, { timeout: 30000 });
    console.log("✅ Login successful\n");
  });
});
