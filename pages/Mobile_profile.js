import { expect } from "@playwright/test";

export class Mobile_profile {
  constructor(page) {
    this.page = page;

    // Top bar avatar: two <img> live inside SuperjTopBar-module (SuperJ logo,
    // then the profile icon) — index 1 is the profile icon (alt="profile icon").
    this.profileIcon = page.locator(
      "//div[contains(@class,'SuperjTopBar-module')]//img"
    ).nth(1);

    this.profilePageHeader = page.locator(
      "//p[normalize-space()='Profile Page'] | //*[normalize-space(text())='Profile Page']"
    ).first();

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

    this.transactionHistoryHeader = page.locator(
      "text=Transaction History"
    ).first();
  }

  async openProfilePage() {
    await this.profileIcon.click();
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
    await this.historyButton.click();
    await this.page.waitForURL(/\/transaction-history/, { timeout: 15000 });
  }

  async verifyTransactionHistoryPage() {
    await expect(this.transactionHistoryHeader).toBeVisible({ timeout: 15000 });
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async cancelLogout() {
    await this.logoutCancel.click();
  }

  async confirmLogout() {
    await this.logoutConfirmYes.click();
  }
}
