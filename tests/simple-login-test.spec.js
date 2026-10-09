/**
 * Simple Login Test - Manual OTP Entry
 *
 * NO WhatsApp automation, NO Chrome downloads needed!
 * Just enter OTP manually when prompted.
 *
 * Uses correct selectors from working Mobile_login.js
 *
 * Usage:
 *   npm run test:simple-login
 */

import { test, expect } from "@playwright/test";

test("Simple Login - Phone 7995672049", async ({ page }) => {
  const PHONE = "7995672049";

  console.log("\n" + "=".repeat(70));
  console.log("🔐 SIMPLE LOGIN TEST - Phone 7995672049");
  console.log("=".repeat(70) + "\n");

  // Step 1: Launch app
  console.log("📍 Step 1: Launch App");
  await page.goto("https://superj.app", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  console.log("✅ App loaded\n");

  // Step 2: Click Start Now
  console.log("📍 Step 2: Click 'Start Now'");
  const startBtn = page.locator("//button[normalize-space()='Start Now']");
  await expect(startBtn).toBeVisible({ timeout: 30000 });
  await startBtn.click();
  console.log("✅ Start Now clicked\n");

  // Step 3: Enter phone
  console.log("📍 Step 3: Enter Phone Number");
  const phoneInput = page.locator("//input[@placeholder='Phone number']");
  await expect(phoneInput).toBeVisible({ timeout: 10000 });
  await phoneInput.fill(PHONE);
  console.log(`✅ Phone entered: ${PHONE}\n`);

  // Step 4: Click Continue
  console.log("📍 Step 4: Click 'Continue' to Request OTP");
  const continueBtn = page.locator("//button[normalize-space()='Continue']");
  await continueBtn.click();
  console.log("✅ OTP requested\n");

  // Step 5: Wait for OTP field
  console.log("📍 Step 5: Wait for OTP Screen");
  await page.waitForTimeout(2000);
  const otpInput = page.getByLabel("Enter the 6 digit code");
  await expect(otpInput).toBeVisible({ timeout: 15000 });
  console.log("✅ OTP input field appeared\n");

  // Step 6: User enters OTP manually
  console.log("=".repeat(70));
  console.log("📱 CHECK YOUR WHATSAPP NOW!");
  console.log("=".repeat(70));
  console.log("\n🔔 You have 60 SECONDS to:");
  console.log("   1. Check WhatsApp for OTP message");
  console.log("   2. Copy the 6-digit OTP");
  console.log("   3. Go to your browser (should be open)");
  console.log("   4. Paste OTP in the field");
  console.log("   5. Submit\n");
  console.log("⏳ Test is waiting for you to enter OTP...\n");

  // Wait for user to enter OTP (page will auto-submit or we check for navigation)
  try {
    await page.waitForURL(/\/Home/, { timeout: 120000 }); // Wait 2 minutes
    console.log("\n✅ ✅ ✅ LOGIN SUCCESSFUL! ✅ ✅ ✅");
    console.log("✅ Redirected to /Home page\n");
  } catch (error) {
    console.error("\n❌ Login timed out or failed");
    console.error("   Did you enter the OTP?");
    throw error;
  }

  // Verify page loaded
  console.log("📍 Verify Home Page Loaded");
  const welcomeText = page.getByRole("heading", { name: /welcome/i });
  if (await welcomeText.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log("✅ Welcome heading visible");
  }

  const surveys = page.getByRole("button", { name: /start survey/i });
  const surveyCount = await surveys.count();
  if (surveyCount > 0) {
    console.log(`✅ ${surveyCount} surveys loaded`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("🎉 LOGIN TEST COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(70));
  console.log("\n📊 Summary:");
  console.log(`   ✅ Phone: +917995672049`);
  console.log(`   ✅ Status: LOGGED IN`);
  console.log(`   ✅ Page: /Home`);
  console.log(`   ✅ Time: ${new Date().toLocaleTimeString()}`);
  console.log("\n" + "=".repeat(70) + "\n");
});
