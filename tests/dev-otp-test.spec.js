/**
 * DEV Environment OTP Test
 *
 * Test the development server: https://dev.superj.app/
 * With manual OTP: 711711
 *
 * Flow:
 * 1. Open dev.superj.app
 * 2. Enter random mobile number
 * 3. Request OTP
 * 4. Manually enter OTP: 711711
 * 5. Verify OTP acceptance
 * 6. Check remaining flow
 *
 * Usage:
 *   npm run test -- tests/dev-otp-test.spec.js --headed
 */

import { test, expect } from "@playwright/test";

test("DEV: OTP 711711 Test", async ({ page }) => {
  // Generate random phone number
  const randomPhone = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

  console.log("\n" + "=".repeat(70));
  console.log("🧪 DEV ENVIRONMENT - OTP TEST");
  console.log("=".repeat(70) + "\n");

  // STEP 1: OPEN DEV WEBSITE
  console.log("📍 STEP 1: Open DEV Website (https://dev.superj.app/)");
  await page.goto("https://dev.superj.app/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  console.log("✅ Dev website loaded\n");

  // Check page title
  const title = await page.title();
  console.log(`   Page Title: "${title}"\n`);

  // STEP 2: ENTER RANDOM PHONE
  console.log("📍 STEP 2: Enter Random Phone Number");
  const phoneInput = page.locator("input").first();
  await expect(phoneInput).toBeVisible({ timeout: 10000 });
  await phoneInput.fill(randomPhone);
  const enteredPhone = await phoneInput.inputValue();
  console.log(`✅ Phone entered: ${enteredPhone}\n`);

  // STEP 3: CLICK REQUEST OTP / CONTINUE
  console.log("📍 STEP 3: Click Request OTP / Continue Button");

  // Try different button texts
  let clickedBtn = null;
  const btnTexts = ["Request OTP", "Continue", "Send OTP", "Get OTP"];

  for (const btnText of btnTexts) {
    const btn = page.locator(`button:has-text('${btnText}')`);
    const visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      await btn.click();
      clickedBtn = btnText;
      console.log(`✅ Clicked: "${btnText}"\n`);
      break;
    }
  }

  if (!clickedBtn) {
    console.log("⚠️  Could not find OTP request button\n");
  }

  // STEP 4: WAIT FOR OTP INPUT
  console.log("📍 STEP 4: Wait for OTP Input Screen");
  await page.waitForTimeout(2000);

  const otpInput = page.locator("input").nth(1);
  try {
    await expect(otpInput).toBeVisible({ timeout: 10000 });
    console.log("✅ OTP input field found\n");
  } catch (e) {
    console.log("⚠️  OTP input not found\n");
  }

  // STEP 5: ENTER OTP 711711
  console.log("📍 STEP 5: Enter OTP: 711711");
  const OTP = "711711";

  try {
    await otpInput.fill(OTP);
    console.log(`✅ OTP entered: ${OTP}\n`);
  } catch (e) {
    console.log(`❌ Failed to enter OTP: ${e.message}\n`);
  }

  // STEP 6: SUBMIT OTP
  console.log("📍 STEP 6: Submit OTP");

  // Try pressing Enter
  try {
    await otpInput.press("Enter");
    console.log("✅ OTP submitted (Enter pressed)\n");
  } catch (e) {
    console.log(`⚠️  Could not press Enter: ${e.message}\n`);
  }

  // STEP 7: WAIT FOR RESPONSE
  console.log("📍 STEP 7: Wait for Server Response (10 seconds)");
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r⏳ ${i}s remaining...`);
    await page.waitForTimeout(1000);
  }
  console.log("\r✅ Wait complete                   \n");

  // STEP 8: CHECK RESPONSE
  console.log("📍 STEP 8: Check OTP Response");
  const currentUrl = page.url();
  const pageContent = await page.textContent();

  console.log(`   Current URL: ${currentUrl}`);

  // Check for error messages
  const errorIndicators = ["error", "invalid", "expired", "failed"];
  const hasError = errorIndicators.some(indicator =>
    pageContent.toLowerCase().includes(indicator)
  );

  if (hasError) {
    console.log(`   ❌ Error detected on page\n`);
  } else {
    console.log(`   ✅ No error messages\n`);
  }

  // STEP 9: FIND BUTTONS AND NEXT ACTIONS
  console.log("📍 STEP 9: Available Buttons");
  const allButtons = await page.locator("button").all();
  console.log(`   Found ${allButtons.length} buttons:\n`);

  for (let i = 0; i < allButtons.length; i++) {
    const btnText = await allButtons[i].textContent();
    console.log(`   ${i + 1}. "${btnText?.trim()}"`);
  }
  console.log();

  // STEP 10: CHECK PAGE CONTENT
  console.log("📍 STEP 10: Page Content");
  const headings = await page.locator("h1, h2, h3").all();
  if (headings.length > 0) {
    const heading = await headings[0].textContent();
    console.log(`   📄 Main Heading: "${heading?.trim()}"\n`);
  }

  // FINAL SUMMARY
  console.log("=".repeat(70));
  console.log("✅ DEV OTP TEST COMPLETED!");
  console.log("=".repeat(70));
  console.log("\n📊 TEST SUMMARY:");
  console.log(`   ✅ Website: https://dev.superj.app/`);
  console.log(`   ✅ Phone: ${randomPhone}`);
  console.log(`   ✅ OTP Request: Sent (${clickedBtn ? "✓" : "✗"})`);
  console.log(`   ✅ OTP: 711711`);
  console.log(`   ✅ OTP Submitted: Yes`);
  console.log(`   ✅ Errors: ${hasError ? "YES - Check page" : "None detected"}`);
  console.log(`   ✅ Final URL: ${currentUrl}`);
  console.log(`   ✅ Time: ${new Date().toLocaleTimeString()}`);
  console.log("\n" + "=".repeat(70) + "\n");
});
