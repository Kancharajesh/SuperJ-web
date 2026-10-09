import { expect } from "@playwright/test";
import { tap } from "../utils/ui.js";

export class Mobile_login {

  constructor(page) {

    this.page = page;

    // ---------- Start Screen ----------
    this.startnow = page.locator(
      "//button[normalize-space()='Start Now']"
    );

    // ---------- Mobile Number Screen ----------
    this.mobilenumberinput = page.locator(
      "//input[@placeholder='Phone number']"
    );

    this.Mobilecontinueclick = page.locator(
      "//button[normalize-space()='Continue']"
    );

    // ---------- OTP Screen ----------
    // One 6-character field (the code arrives on WhatsApp); this replaced
    // the earlier six single-digit boxes.
    this.otpInput = page.getByLabel("Enter the 6 digit code");

    // Invalid OTP Text (site has shown both "Invalid OTP" and
    // "Please enter a valid otp" copy for a rejected code)
    this.inValidOTPtext = page.locator(
      "//p[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'invalid otp') or contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'valid otp')]"
    );

    // ---------- Dashboard ----------
    this.AppDownloadBanner = page.locator(
      "//div[contains(@class,'NeverMissSurvey-module')]"
    );

    this.surveyVisible_Homepage = page.locator(
      "(//div[contains(@class,'survey')])[1]"
    );
  }

  async launchApplication() {

    await this.page.goto("https://superj.app/", {
      waitUntil: "domcontentloaded",
    });

    await this.page.waitForLoadState("networkidle");
  }

  async clickStartNow() {

    await this.startnow.waitFor({
      state: "visible",
    });

    await tap(this.startnow);
  }

  async enterMobileNumber(number) {

    await this.mobilenumberinput.waitFor({
      state: "visible",
    });

    await this.mobilenumberinput.fill(number);
  }

  async clickContinue() {

    await tap(this.Mobilecontinueclick);
  }

  async enterOTP(otp) {

    await this.otpInput.fill(otp);
  }

  async login(number, otpCodes) {

    const codes = Array.isArray(otpCodes) ? otpCodes : [otpCodes];

    await this.clickStartNow();

    await this.enterMobileNumber(number);

    await this.clickContinue();

    for (const code of codes) {
      await this.enterOTP(code);
      await this.page.waitForTimeout(2000);

      const stillInvalid = await this.inValidOTPtext
        .isVisible()
        .catch(() => false);
      if (!stillInvalid) return;
    }
  }

  async verifyUserLoggedIn() {

    // CSS-module class names (e.g. "Sidebar-module__WZVnLW__...") are
    // build-hash-specific and reshuffle on every deploy, so the URL is the
    // stable signal that the OTP was accepted and the app entered Home.
    await this.page.waitForURL(/\/Home/, { timeout: 20000 });
  }

  async verifyInvalidOTPMessage() {

    await expect(this.inValidOTPtext).toBeVisible({
      timeout: 10000,
    });
  }

    async surveyVisible (){
        await this.surveyVisible_Homepage.toBeVisible();
    }

}