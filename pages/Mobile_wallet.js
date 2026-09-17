import { expect } from "@playwright/test";

export class Mobile_wallet {
  constructor(page) {
    this.page = page;

    // Bottom nav: Home / Wallet / Discussions. "Wallet" routes to /rewards.
    this.clickonWallet = page.locator(
      "//div[@class='urbanist_21f4fdec-module__hNISTG__className']//a[2]"
    );

    this.Userbalancevisible = page.locator(
      "(//div[@class='CashBalanceComponent-module__xUC3AW__container'])[1]"
    );
    this.GiftcardsVisible = page.locator(
      "(//div[@class='MyGiftCardsComponent-module__XlpArG__container'])[1]"
    );
    this.CouponsVisible = page.locator(
      "(//div[contains(@class,'RecentCouponsComponent-module')])[1]"
    );
    this.CashOutButton = page.locator(
      "//button[normalize-space()='Cash Out']"
    );
  }

  async openWallet() {
    await this.clickonWallet.click();
    await this.page.waitForURL(/\/rewards/, { timeout: 15000 });
  }

  async verifyCashBalance() {
    await expect(this.Userbalancevisible).toBeVisible({ timeout: 15000 });
  }

  async verifyGiftCards() {
    await expect(this.GiftcardsVisible).toBeVisible({ timeout: 15000 });
  }

  async verifyCoupons() {
    await expect(this.CouponsVisible).toBeVisible({ timeout: 15000 });
  }
}
