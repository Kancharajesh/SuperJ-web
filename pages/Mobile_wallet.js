import { expect } from "@playwright/test";
import { tap } from "../utils/ui.js";

export class Mobile_wallet {
  constructor(page) {
    this.page = page;

    // Bottom nav: Home / Wallet / Discussions. "Wallet" routes to /rewards.
    // Hashed CSS-module class names change on every deploy; use text/hrefs.
    this.clickonWallet = page.locator("a[href='/rewards']");

    this.Userbalancevisible = page.getByText("Wallet balance", { exact: true });
    this.GiftcardsVisible = page.getByText("My Gift Cards", { exact: true });
    // The old "Recent coupons" section was replaced by the gift-card list.
    this.CouponsVisible = page.getByRole("button", { name: /View all gift cards/ });
    this.CashOutButton = page.locator(
      "//button[normalize-space()='Cash Out']"
    );
  }

  async openWallet() {
    await tap(this.clickonWallet);
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
