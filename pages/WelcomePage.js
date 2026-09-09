import { expect } from "@playwright/test";

export class WelcomePage {
  constructor(page) {
    this.page = page;

    // ---------- Mobile Number / Welcome Page ----------
    this.Mobilenumber_inputfiled = page.locator(
      "(//input[@aria-label='phone-number-input'])[1]"
    );

    this.RequestOTP = page.locator(
      "(//button[normalize-space()='Request OTP'])[1]"
    );

    this.Mobilenumber_validationmessage = page.locator(
      "(//span[contains(@class,'text-[#D20505]')])[1]"
    );

    // ---------- OTP Page ----------
    this.OTP_6 = page.locator("(//div[contains(@class,'gap-4')])[1]");

    this.ResendOTP = page.locator(
      "//button[normalize-space()='Resend OTP']"
    );

    this.OTP_validationmessage = page.locator(
      "(//p[contains(@class,'text-[#D20505]')])[1]"
    );

    // OTP Input boxes (6 separate single-digit inputs, aria-label="OTP digit N")
    this.OTP_Input_Boxes = page.locator("input[type='tel']");

    this.OTPInvalidMessage = page.locator(
      "//p[contains(text(),'valid otp') or contains(text(),'Invalid OTP')]"
    );

    // ---------- Home/Dashboard ----------
    this.Sidebar = page.locator(
      "(//div[contains(@class,'Sidebar')])[1]"
    );
  }

  // ---------- Launch Application ----------
  async launchTheBrowser() {
    await this.page.goto("https://superj.app/", {
      waitUntil: "domcontentloaded",
    });

    await this.page.waitForLoadState("networkidle");
  }

  // ---------- Enter Mobile Number ----------
  async enterMobileNumber(number) {
    await this.Mobilenumber_inputfiled.waitFor({
      state: "visible",
    });

    await this.Mobilenumber_inputfiled.fill(number);
  }

  // ---------- Click Request OTP ----------
  async clickRequestOTP() {
    await this.RequestOTP.waitFor({
      state: "visible",
    });

    await this.RequestOTP.click();
  }

  // ---------- Enter OTP ----------
  async enterOTP(otp) {
    await this.OTP_6.waitFor({
      state: "visible",
    });

    const digits = otp.split("");
    for (let i = 0; i < digits.length; i++) {
      await this.page
        .locator(`//input[@aria-label='OTP digit ${i + 1}']`)
        .fill(digits[i]);
    }

    // Wait for verification request to complete
    await this.page.waitForTimeout(3000);
  }

  // ---------- Login Method (tries each OTP code until one is accepted) ----------
  async loginToApplication(number, otpCodes) {
    const codes = Array.isArray(otpCodes) ? otpCodes : [otpCodes];

    await this.enterMobileNumber(number);
    await this.clickRequestOTP();
    await expect(this.OTP_6).toBeVisible();

    for (const code of codes) {
      await this.enterOTP(code);

      const loggedIn = await this.Sidebar.isVisible().catch(() => false);
      if (loggedIn) return;

      const stillInvalid = await this.OTPInvalidMessage
        .isVisible()
        .catch(() => false);
      if (!stillInvalid) return; // no error shown, assume it went through
    }
  }

  // ---------- Verify Sidebar ----------
  async verifyUserLoggedIn() {
    await expect(this.Sidebar).toBeVisible({
      timeout: 20000,
    });
  }

  // ---------- Verify Mobile Validation ----------
  async verifyMobileValidationMessage() {
    await expect(
      this.Mobilenumber_validationmessage
    ).toBeVisible();
  }

  // ---------- Verify OTP Validation ----------
  async verifyOTPValidationMessage() {
    await expect(
      this.OTP_validationmessage
    ).toBeVisible();
  }

  // ---------- Click Resend OTP ----------
  async clickResendOTP() {
    await this.ResendOTP.waitFor({
      state: "visible",
    });

    await this.ResendOTP.click();
  }
}