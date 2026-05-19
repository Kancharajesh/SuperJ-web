import { expect } from "@playwright/test";

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
    this.OTP_1 = page.locator(
      "//input[@aria-label='Please enter OTP character 1']"
    );

    this.OTP_2 = page.locator(
      "//input[@aria-label='Please enter OTP character 2']"
    );

    this.OTP_3 = page.locator(
      "//input[@aria-label='Please enter OTP character 3']"
    );

    this.OTP_4 = page.locator(
      "//input[@aria-label='Please enter OTP character 4']"
    );

    this.OTP_5 = page.locator(
      "//input[@aria-label='Please enter OTP character 5']"
    );

    this.OTP_6 = page.locator(
      "//input[@aria-label='Please enter OTP character 6']"
    );

    // Invalid OTP Text
    this.inValidOTPtext = page.locator(
      "//p[contains(text(),'Invalid OTP')]"
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

    await this.startnow.click();
  }

  async enterMobileNumber(number) {

    await this.mobilenumberinput.waitFor({
      state: "visible",
    });

    await this.mobilenumberinput.fill(number);
  }

  async clickContinue() {

    await this.Mobilecontinueclick.click();
  }

  async enterOTP(otp) {

    const digits = otp.split("");

    await this.OTP_1.fill(digits[0]);
    await this.OTP_2.fill(digits[1]);
    await this.OTP_3.fill(digits[2]);
    await this.OTP_4.fill(digits[3]);
    await this.OTP_5.fill(digits[4]);
    await this.OTP_6.fill(digits[5]);
  }

  async login(number, otp) {

    await this.clickStartNow();

    await this.enterMobileNumber(number);

    await this.clickContinue();

    await this.enterOTP(otp);
  }

//   async verifyUserLoggedIn() {

//     await expect(this.AppDownloadBanner).toBeVisible({
//       timeout: 20000,
//     });
//   }

  async verifyInvalidOTPMessage() {

    await expect(this.inValidOTPtext).toBeVisible({
      timeout: 10000,
    });
  }

    async surveyVisible (){
        await this.surveyVisible_Homepage.toBeVisible();
    }

}