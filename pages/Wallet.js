import { expect } from "@playwright/test";

export class Wallet {
  constructor(page) {
    this.page = page;

    this.wallet_button = page.locator(
      "(//li[contains(@class,'Sidebar-module')])[2]"
    );

    this.cash_balance = page.locator(
      "(//div[contains(@class,'CashBalance-module')])[1]"
    );

    this.coupons = page.locator(
      "(//div[contains(@class,'RecentCoupons-module')])[1]"
    );
  }

  async openWallet() {
    await this.wallet_button.click();
  }

  async verifyCashBalance() {
    await expect(this.cash_balance).toBeVisible({
      timeout: 15000,
    });
  }

  async couponsVisible() {
    await expect(this.coupons).toBeVisible({
      timeout: 15000,
    });
  }
}