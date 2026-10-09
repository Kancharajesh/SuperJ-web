import { expect } from "@playwright/test";
import { tap } from "../utils/ui.js";

export class Mobile_profile {
  constructor(page) {
    this.page = page;

    this.profileIcon = page.getByAltText("profile icon");

    this.profilePageHeader = page.getByText("Profile", { exact: true }).filter({ visible: true }).first();

    this.didBanner = page.locator("text=This is your DID").first();
    this.referButton = page.locator("text=Refer a friend").first();
    this.historyButton = page.locator("text=My History").first();
    this.personalInfoSection = page.locator("text=Personal Information").first();
    this.accountSection = page.locator("text=Account").first();
    this.logoutButton = page.locator("text=Logout").first();

    this.logoutConfirmYes = page.locator(
      "//button[normalize-space()=\"Yes, I'll be back\"]"
    );
    this.logoutCancel = page.locator("//button[normalize-space()='Cancel']");

    // History page header is "History" with Transactions/Verifications tabs.
    this.transactionHistoryHeader = page.getByRole("button", { name: "Transactions" });
  }

  async openProfilePage() {
    await tap(this.profileIcon);
    await this.page.waitForURL(/\/profile/, { timeout: 15000 });
  }

  async verifyProfilePage() {
    await expect(this.profilePageHeader).toBeVisible({ timeout: 15000 });
  }

  async verifyDIDVisible() {
    await expect(this.didBanner).toBeVisible({ timeout: 15000 });
  }

  async verifyReferButton() {
    await expect(this.referButton).toBeVisible({ timeout: 15000 });
  }

  async verifyPersonalInfo() {
    await expect(this.personalInfoSection).toBeVisible({ timeout: 15000 });
  }

  async clickHistory() {
    await tap(this.historyButton);
    await this.page.waitForURL(/\/transaction-history/, { timeout: 15000 });
  }

  async verifyTransactionHistoryPage() {
    await expect(this.transactionHistoryHeader).toBeVisible({ timeout: 15000 });
  }

  async clickLogout() {
    await tap(this.logoutButton);
  }

  async cancelLogout() {
    await tap(this.logoutCancel);
  }

  async confirmLogout() {
    await tap(this.logoutConfirmYes);
  }
}
