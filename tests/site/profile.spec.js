import { test, expect } from "@playwright/test";
import { button, open } from "../../utils/ui.js";

// Desktop Profile, Help & Support and Transaction History. TC-PRO-* in
// TEST_CASES.md. Nothing here saves profile edits, sends support messages
// or confirms logout.
test.describe("Desktop Profile", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/profile");
    await expect(page.getByRole("heading", { name: "Decentralised ID" })).toBeVisible();
  });

  test("TC-PRO-01 shows the full DID", async ({ page }) => {
    await expect(page.getByText(/^did:zkjm:superj:[0-9a-fA-F]{40}$/)).toBeVisible();
  });

  test("TC-PRO-02 Learn more about DID explains what the DID does", async ({ page }) => {
    await button(page, "Learn more about DID").click();
    await expect(page.getByText("Your Decentralised ID")).toBeVisible();
    await expect(page.getByText("It ensures you have 100% Data Privacy.")).toBeVisible();
  });

  test("TC-PRO-03 Refer a friend offers Copy Link, Email, Messages and WhatsApp", async ({ page }) => {
    await button(page, /REFER A FRIEND/).click();
    for (const option of ["Copy Link", "Email", "Messages", "WhatsApp"]) await expect(page.getByText(option, { exact: true })).toBeVisible();
  });

  test("TC-PRO-04 shows gender, birth year, city and account creation date", async ({ page }) => {
    for (const label of ["Gender", "Birth Year", "City"]) await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByText(/^(19|20)\d{2}$/)).toBeVisible();
    await expect(page.getByText(/^\d{2} [A-Z][a-z]{2} \d{4}$/)).toBeVisible();
  });

  test("TC-PRO-05 Edit opens the edit form with Email ID and Save (not saved)", async ({ page }) => {
    await button(page, "Edit").click();
    await expect(page).toHaveURL(/\/profile-edit$/);
    await expect(page.getByText("Edit Profile")).toBeVisible();
    await expect(page.getByText("Email ID")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("TC-PRO-06 Privacy Policy opens the policy page", async ({ page }) => {
    await button(page, "Privacy Policy").click();
    await expect(page).toHaveURL(/\/privacy-policy-sj$/);
    await expect(page.getByText("INFORMATION COLLECTION AND USAGE", { exact: false })).toBeVisible();
  });

  test("TC-PRO-07 View All opens the full transaction history", async ({ page }) => {
    await expect(page.getByText("Transaction History")).toBeVisible();
    await button(page, "View All").click();
    await expect(page).toHaveURL(/\/transaction-history$/);
  });

  test("TC-PRO-08 Logout asks for confirmation and Cancel keeps the session", async ({ page }) => {
    await button(page, "Logout").click();
    await expect(page.getByText("Sure you want to logout?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, I'll be back" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Sure you want to logout?")).toBeHidden();
    await expect(page).toHaveURL(/\/profile$/);
  });
});

test.describe("Desktop Help & Support", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/help-support");
    await expect(page.getByText("FAQs")).toBeVisible();
  });

  test("TC-HELP-01 lists six FAQs and expands an answer on click", async ({ page }) => {
    const question = page.getByText("Is my personal data secure?");
    await expect(page.getByText(/\?$/)).toHaveCount(6);
    await question.click();
    await expect(page.getByText(/We take your privacy and security seriously/)).toBeVisible();
  });

  test("TC-HELP-02 Contact Us opens a 300-character question form (not sent)", async ({ page }) => {
    await button(page, "Contact Us").click();
    await expect(page.getByText("Ask a question")).toBeVisible();
    const box = page.getByPlaceholder("Enter your question here");
    await expect(box).toHaveAttribute("maxlength", "300");
    await box.fill("x".repeat(320));
    await expect(box).toHaveValue("x".repeat(300));
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("TC-HELP-03 Terms & Conditions opens jupitermeta.io in a new tab", async ({ page, context }) => {
    const [tab] = await Promise.all([context.waitForEvent("page"), button(page, "Terms & Conditions").click()]);
    await expect(tab).toHaveURL(/jupitermeta\.io\/terms-conditions/);
    await tab.close();
  });
});

test.describe("Desktop Transaction History", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/transaction-history");
    await expect(page.getByText("Transaction History")).toBeVisible();
  });

  const dates = async (page) => (await page.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/).allInnerTexts()).map((d) => new Date(d).getTime());

  test("TC-TXN-01 entries show title, type, reward and date, newest first", async ({ page }) => {
    await expect(page.getByText("Survey", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/^\+\d+$/).first()).toBeVisible();
    const shown = await dates(page);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown).toEqual([...shown].sort((a, b) => b - a));
  });

  test("TC-TXN-02 Show More loads older entries", async ({ page }) => {
    const before = (await dates(page)).length;
    await button(page, "Show More").click();
    await expect.poll(async () => (await dates(page)).length).toBeGreaterThan(before);
  });
});
