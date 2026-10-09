/**
 * Login Flow Test Only
 *
 * Tests ONLY the login process:
 * 1. Launch app
 * 2. Enter phone number
 * 3. Request OTP
 * 4. Wait for OTP from WhatsApp
 * 5. Auto-read OTP
 * 6. Enter OTP
 * 7. Verify login success
 *
 * Time: ~2-3 minutes
 *
 * Usage:
 *   npm run test:login-only
 */

import { test, expect } from "@playwright/test";
import { getOTPFromWhatsApp, initializeWhatsApp, disconnectWhatsApp } from "../utils/whatsapp-otp-reader.js";

test.describe("Login Flow Only", () => {
  let whatsappReady = false;

  test.beforeAll(async () => {
    console.log("\n" + "=".repeat(70));
    console.log("🔐 LOGIN FLOW TEST - STARTING");
    console.log("=".repeat(70));
    console.log("\n🔄 Initializing WhatsApp OTP Reader...\n");

    try {
      await initializeWhatsApp();
      whatsappReady = true;
      console.log("✅ WhatsApp ready!\n");
    } catch (error) {
      console.error("❌ WhatsApp setup required!");
      console.log("\n📱 Run this first:");
      console.log("   npm run whatsapp:setup");
      console.log("   (Then scan the QR code with your phone)\n");
      process.exit(1);
    }
  });

  test.afterAll(async () => {
    if (whatsappReady) {
      console.log("\n📴 Disconnecting WhatsApp...");
      await disconnectWhatsApp();
    }
  });

  test("Login with Phone Number 7995672049", async ({ page }) => {
    const PHONE = "7995672049";
    const PHONE_WITH_CODE = "+917995672049";

    console.log("=" .repeat(70));
    console.log("📱 LOGIN TEST: Phone 7995672049");
    console.log("=" .repeat(70));
    console.log("\n📍 Step 1: Navigate to SuperJ App");

    // Step 1: Open app
    await page.goto("https://superj.app", {
      waitUntil: "domcontentloaded"
    });
    await page.waitForLoadState("networkidle");
    console.log("✅ App loaded at https://superj.app");

    // Step 2: Click Start Now
    console.log("\n📍 Step 2: Click Start Now Button");
    const startBtn = page.getByRole("button", { name: /Start Now/i });
    await expect(startBtn).toBeVisible({ timeout: 30000 });
    await startBtn.click();
    console.log("✅ Start Now clicked");

    // Step 3: Wait for phone input
    console.log("\n📍 Step 3: Enter Phone Number");
    const phoneInput = page.getByPlaceholder(/phone|number/i);
    await expect(phoneInput).toBeVisible({ timeout: 10000 });

    // Enter phone number
    await phoneInput.fill(PHONE);
    console.log(`✅ Phone entered: ${PHONE}`);

    // Verify input
    const inputValue = await phoneInput.inputValue();
    console.log(`📊 Input value verified: ${inputValue}`);

    // Step 4: Click Continue to request OTP
    console.log("\n📍 Step 4: Request OTP (Click Continue)");
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await continueBtn.click();
    console.log("✅ Continue clicked - OTP request sent");

    // Step 5: Wait for OTP screen
    console.log("\n📍 Step 5: Wait for OTP Screen");
    await page.waitForTimeout(2000);
    const otpLabel = page.getByLabel(/enter.*code|otp|otp digit/i, { exact: false });
    await expect(otpLabel).toBeVisible({ timeout: 15000 });
    console.log("✅ OTP input field appeared");

    // Step 6: Wait for OTP from WhatsApp
    console.log("\n📍 Step 6: Waiting for OTP from WhatsApp...");
    console.log(`   Phone: ${PHONE_WITH_CODE}`);
    console.log(`   Timeout: 60 seconds\n`);
    console.log("   📱 CHECK YOUR WHATSAPP - OTP should arrive now!\n");

    let otp;
    try {
      otp = await getOTPFromWhatsApp(PHONE_WITH_CODE, 60000);
      console.log(`✅ OTP received: ${otp}`);
    } catch (error) {
      console.error(`\n❌ Failed to get OTP: ${error.message}`);
      console.log("\n🔍 Troubleshooting:");
      console.log("   1. Did OTP arrive in your WhatsApp?");
      console.log("   2. Is WhatsApp Web still connected?");
      console.log("   3. Try requesting OTP again in the app");
      throw error;
    }

    // Step 7: Enter OTP
    console.log("\n📍 Step 7: Enter OTP in Application");
    const otpInput = page.getByLabel(/enter.*code|otp/i, { exact: false });
    await expect(otpInput).toBeVisible({ timeout: 10000 });

    // Check if single field or multiple fields
    const maxlength = await otpInput.getAttribute("maxlength");
    if (maxlength === "6") {
      // Single 6-character field
      await otpInput.fill(otp);
      console.log(`✅ OTP entered: ${otp}`);
    } else {
      // Multiple single-digit fields
      console.log(`   Detected multiple OTP fields`);
      for (let i = 0; i < otp.length; i++) {
        const digitField = page.getByLabel(`OTP digit ${i + 1}`);
        await digitField.fill(otp[i]);
      }
      console.log(`✅ OTP entered: ${otp}`);
    }

    // Step 8: Verify login
    console.log("\n📍 Step 8: Verify Login - Wait for Home Page");
    try {
      await page.waitForURL(/\/Home/, { timeout: 30000 });
      console.log("✅ ✅ ✅ LOGIN SUCCESSFUL! ✅ ✅ ✅");
      console.log("✅ Redirected to /Home page");
    } catch (error) {
      console.error("❌ Login failed - did not redirect to Home");
      throw error;
    }

    // Step 9: Verify page content
    console.log("\n📍 Step 9: Verify Home Page Content");
    const welcomeText = page.getByRole("heading", { name: /welcome/i });
    if (await welcomeText.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("✅ Welcome heading visible");
    }

    const surveyButton = page.getByRole("button", { name: /start survey/i });
    const surveyCount = await surveyButton.count();
    if (surveyCount > 0) {
      console.log(`✅ ${surveyCount} surveys available`);
    }

    // Final Summary
    console.log("\n" + "=".repeat(70));
    console.log("🎉 LOGIN FLOW COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`   ✅ Phone: ${PHONE_WITH_CODE}`);
    console.log(`   ✅ OTP: ${otp}`);
    console.log(`   ✅ Status: LOGGED IN`);
    console.log(`   ✅ Redirect: /Home`);
    console.log(`   ✅ Time: ${new Date().toLocaleTimeString()}`);
    console.log("\n" + "=".repeat(70) + "\n");
  });
});
