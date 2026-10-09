/**
 * Diagnostic Test - Find correct selectors
 *
 * Inspects the login page to find working selectors
 */

import { test } from "@playwright/test";

test("Diagnose Login Page", async ({ page }) => {
  console.log("\n📋 DIAGNOSING LOGIN PAGE\n");

  await page.goto("https://superj.app", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: "test-results/page-screenshot.png" });
  console.log("📸 Screenshot saved: test-results/page-screenshot.png\n");

  // Get page HTML
  const html = await page.content();
  console.log("📄 Page URL:", page.url());
  console.log("📄 Page Title:", await page.title());

  // Find all buttons
  const buttons = await page.locator("button").all();
  console.log(`\n🔘 Found ${buttons.length} buttons:`);

  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const btn = buttons[i];
    const text = await btn.textContent();
    const visible = await btn.isVisible();
    console.log(`   ${i + 1}. "${text?.trim()}" ${visible ? "✅ visible" : "❌ hidden"}`);
  }

  // Find all headings
  const headings = await page.locator("h1, h2, h3").all();
  console.log(`\n📌 Found ${headings.length} headings:`);

  for (let i = 0; i < Math.min(headings.length, 5); i++) {
    const heading = headings[i];
    const text = await heading.textContent();
    console.log(`   ${i + 1}. "${text?.trim()}"`);
  }

  // Check for input fields
  const inputs = await page.locator("input").all();
  console.log(`\n📝 Found ${inputs.length} input fields`);

  // Look for any element with "Start" text
  const startElements = await page.locator("text=/start/i").all();
  console.log(`\n🎯 Elements with "Start" text: ${startElements.length}`);
  for (let i = 0; i < Math.min(startElements.length, 5); i++) {
    const elem = startElements[i];
    const tag = await elem.evaluate((el) => el.tagName);
    const text = await elem.textContent();
    console.log(`   ${i + 1}. <${tag}> "${text?.trim()}"`);
  }

  console.log("\n✅ Diagnosis complete!\n");
});
