/**
 * Phone Number Verification Test
 *
 * Verifies that the configured phone number is correct
 * and works with WhatsApp OTP automation.
 */

import { test, expect } from "@playwright/test";
import { getOTPFromWhatsApp, initializeWhatsApp, disconnectWhatsApp } from "../utils/whatsapp-otp-reader.js";

test.describe("Phone Number Verification", () => {
  test("Verify phone number is correctly configured", async () => {
    const phoneNumber = process.env.TEST_PHONE || process.env.PHONE_NUMBER;

    console.log(`\n${"=".repeat(70)}`);
    console.log("📱 PHONE NUMBER VERIFICATION TEST");
    console.log(`${"=".repeat(70)}\n`);

    // Check phone number is set
    expect(phoneNumber, "Phone number not configured in .env").toBeTruthy();

    console.log(`✅ Phone Number Configured: ${phoneNumber}`);

    // Verify format
    const phoneRegex = /^\+?91\d{10}$/;
    expect(phoneNumber).toMatch(phoneRegex);
    console.log(`✅ Phone Number Format Valid`);

    // Extract just the number part
    const numberOnly = phoneNumber.replace(/\D/g, '');
    expect(numberOnly).toBe('7995672049');
    console.log(`✅ Phone Number is: 7995672049`);

    console.log(`\n📋 Configuration Summary:`);
    console.log(`   Base URL: ${process.env.BASE_URL || "https://superj.app"}`);
    console.log(`   Test Phone: ${phoneNumber}`);
    console.log(`   WhatsApp Enabled: ${process.env.WHATSAPP_ENABLED !== 'false'}`);

    console.log(`\n${"=".repeat(70)}\n`);
  });

  test("Verify WhatsApp OTP Reader is ready", async () => {
    console.log(`\n🔄 Checking WhatsApp OTP Reader Status...\n`);

    try {
      await initializeWhatsApp();
      console.log(`✅ WhatsApp OTP Reader initialized successfully`);

      await disconnectWhatsApp();
      console.log(`✅ WhatsApp connection test passed\n`);

    } catch (error) {
      console.error(`❌ WhatsApp initialization failed: ${error.message}`);
      console.log(`\n📌 First-time setup required:`);
      console.log(`   Run: npm run whatsapp:setup`);
      console.log(`   Then scan the QR code with your phone\n`);
      throw error;
    }
  });

  test("Display test configuration", async () => {
    console.log(`\n${"=".repeat(70)}`);
    console.log("✅ TEST CONFIGURATION READY");
    console.log(`${"=".repeat(70)}\n`);

    console.log(`📱 Phone Number: +917995672049`);
    console.log(`🔐 WhatsApp OTP: Automatic (Dynamic)`);
    console.log(`🌐 URL: https://superj.app`);

    console.log(`\n📚 Next Steps:`);
    console.log(`   1. npm run whatsapp:setup (if first time)`);
    console.log(`   2. npm run test:auto-otp`);
    console.log(`   3. WhatsApp OTP will be read automatically`);

    console.log(`\n${"=".repeat(70)}\n`);
  });
});
