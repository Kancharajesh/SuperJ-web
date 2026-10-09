import { expect } from "@playwright/test";

export class Wallet {
  constructor(page) {
    this.page = page;

    // CSS-module class names change on every deploy; use visible text.
    this.wallet_button = page.getByRole("list")
      .filter({ has: page.getByText("Home", { exact: true }) })
      .first().getByText("Wallet", { exact: true });

    this.cash_balance = page.getByText("Wallet balance", { exact: true });

    // The old "Recent coupons" section was replaced by "My Gift Cards".
    this.coupons = page.getByText("My Gift Cards", { exact: true });
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