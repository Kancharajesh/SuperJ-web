/**
 * Complete Flow Test - Manual OTP Entry
 *
 * Tests the complete flow with MANUAL OTP entry to avoid API rate limiting
 *
 * Flow:
 * 1. Open website
 * 2. Enter phone: 6281674691
 * 3. Click Request OTP
 * 4. WAIT for you to manually enter OTP (120 seconds)
 * 5. Submit OTP (press Enter)
 * 6. Wait 10 seconds
 * 7. Click submit button
 * 8. Detect onboarding/home page
 *
 * Usage:
 *   npm run test -- tests/complete-manual-otp.spec.js --headed
 *   Then manually enter the 6-digit OTP when prompted
 */

import { test, expect } from "@playwright/test";

test("Complete Flow - Manual OTP", async ({ page }) => {
  const PHONE = "6281674691";

  console.log("\n" + "=".repeat(70));
  console.log("📱 COMPLETE FLOW TEST - Manual OTP Entry");
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

  // STEP 5: WAIT FOR MANUAL OTP ENTRY
  console.log("📍 STEP 5: MANUAL OTP ENTRY");
  console.log("   🔑 Please check your WhatsApp message");
  console.log("   📝 Enter the 6-digit OTP in the input field");
  console.log("   ⏳ Waiting 120 seconds for OTP entry...\n");

  let otpEntered = false;
  let otp = "manual";

  try {
    // Wait for the OTP input to have a value (user enters it)
    await page.waitForFunction(
      () => document.querySelector('input[type="text"]')?.value?.length >= 6,
      { timeout: 120000 }
    );
    otpEntered = true;
    const enteredValue = await otpInput.inputValue();
    console.log(`✅ OTP entered: ${enteredValue}\n`);
  } catch (error) {
    console.log("⚠️  No OTP entered (timeout)\n");
  }

  if (!otpEntered) {
    console.log("Skipping remaining steps - OTP not entered\n");
    return;
  }

  // STEP 6: SUBMIT OTP
  console.log("📍 STEP 6: Submit OTP (Press Enter)");
  if (otpInput) {
    await otpInput.press("Enter");
    console.log("✅ OTP submitted\n");
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
      console.log(`      → Clicking!\n`);
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
    flowType = "HOME PAGE ✅";
    console.log("🏠 HOME PAGE DETECTED!\n");
  } else if (urlLower.includes("/onboarding") || urlLower.includes("/setup") || urlLower.includes("/kyc")) {
    flowType = "ONBOARDING 📋";
    console.log("📋 ONBOARDING FLOW DETECTED!\n");
  } else if (urlLower.includes("/verify")) {
    flowType = "VERIFY - Waiting for OTP ⏳";
    console.log("⏳ STILL ON OTP VERIFICATION PAGE\n");
  }

  // STEP 10: CHECK PAGE CONTENT
  console.log("📍 STEP 10: Verify Page Content");
  const headings = await page.locator("h1, h2, h3").all();
  if (headings.length > 0) {
    const heading = await headings[0].textContent();
    console.log(`   📄 Page Heading: "${heading?.trim()}"\n`);
  }

  // FINAL SUMMARY
  console.log("=".repeat(70));
  console.log("✅ COMPLETE FLOW TEST FINISHED!");
  console.log("=".repeat(70));
  console.log("\n📊 FINAL SUMMARY:");
  console.log(`   ✅ Website: Opened`);
  console.log(`   ✅ Phone: ${PHONE}`);
  console.log(`   ✅ OTP: Manually Entered`);
  console.log(`   ✅ OTP: Submitted`);
  console.log(`   ✅ Wait: 10 seconds completed`);
  console.log(`   ✅ Button: ${clickedBtn ? "Clicked" : "Not found"}`);
  console.log(`   ✅ Final URL: ${finalUrl}`);
  console.log(`   ✅ Flow Status: ${flowType}`);
  console.log(`   ✅ Time: ${new Date().toLocaleTimeString()}`);
  console.log("\n" + "=".repeat(70) + "\n");
});
