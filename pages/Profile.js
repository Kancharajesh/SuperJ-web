import { expect } from "@playwright/test";

export class Profile {
  constructor(page) {
    this.page = page;

    this.side_profile = page.locator(
      "(//p[normalize-space()='Profile'])[1]"
    );

    this.did_section = page.locator("(//div)[21]");

    this.refer_button = page.locator(
      "(//button[contains(@class,'min-[1728px]:w-[562.44px]')])[1]"
    );

    this.profile_info = page.locator("(//div)[31]");
    this.transaction_history = page.locator("(//div)[44]");

    this.transaction_viewall = page.locator(
      "(//button[normalize-space()='View All'])[1]"
    );

    this.transaction_details = page.locator(
      "(//div[contains(@class,'Cash-module')])[1]"
    );

    this.logout_button = page.locator(
      "(//button[normalize-space()='Logout'])[1]"
    );

    this.logout_cancel = page.locator(
      "//button[normalize-space()='Cancel']"
    );

    this.logout_yes = page.locator(
      "//button[contains(@class,'logout-module') or normalize-space()='Yes']"
    );

    this.profile_fullpage = page.locator("(//div)[17]");

    this.profile_afterlogout = page.locator(
      "//div[contains(@class,'absolute inset-0 flex flex-col')]"
    );
  }

  async verifyVisible(locator) {
    await expect(locator).toBeVisible({ timeout: 15000 });
  }

  async openProfilePage() {
    await this.side_profile.click();
    await this.page.waitForTimeout(3000);
  }

  async verifyProfilePage() {
    await this.verifyVisible(this.profile_fullpage);
  }

  async verifyProfileInfo() {
    await this.verifyVisible(this.profile_info);
  }

  async verifyDIDSection() {
    await this.verifyVisible(this.did_section);
  }

  async verifyReferButton() {
    await this.verifyVisible(this.refer_button);
  }

  async clickReferButton() {
    await this.refer_button.click();
  }

  async verifyTransactionHistory() {
    await this.verifyVisible(this.transaction_history);
  }

  async clickTransactionViewAll() {
    await this.transaction_viewall.click();
  }

  async verifyTransactionDetails() {
    await this.verifyVisible(this.transaction_details);
  }

  async clickLogout() {
    await this.logout_button.click();
  }

  async clickLogoutCancel() {
    await this.logout_cancel.click();
  }

  async confirmLogout() {
    await this.logout_yes.click();
  }

  async verifyAfterLogoutScreen() {
    await this.verifyVisible(this.profile_afterlogout);
  }
}