import { test, expect } from "@playwright/test";
import { button, open } from "../../utils/ui.js";

// Desktop sidebar, shared header controls and routing. TC-NAV-* in TEST_CASES.md.
const sidebar = (page) => page.getByRole("list").filter({ has: page.getByText("Home", { exact: true }) }).first();

test.describe("Desktop navigation", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/Home");
    await expect(sidebar(page)).toBeVisible();
  });

  test("TC-NAV-01 sidebar lists Home, Wallet, Discussions and Profile", async ({ page }) => {
    await expect(sidebar(page).locator("li")).toHaveText(["Home", "Wallet", "Discussions", "Profile"]);
  });

  for (const [item, url, title] of [
    ["Wallet", /\/rewards$/, "Rewards | SuperJ"],
    ["Discussions", /\/focus-group\/discussions$/, "SuperJ | Surveys & Rewards"],
    ["Profile", /\/profile$/, "My Profile | SuperJ"],
    ["Home", /\/Home$/, "Home | SuperJ"],
  ]) {
    test(`TC-NAV-02 sidebar ${item} opens ${url.source}`, async ({ page }) => {
      if (item === "Home") await sidebar(page).getByText("Profile", { exact: true }).click();
      await sidebar(page).getByText(item, { exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page).toHaveTitle(title);
    });
  }

  test("TC-NAV-03 Copy DID copies the user's full DID", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await expect(page.getByText(/^did:zkjm:superj:\.\.\.$/)).toBeVisible();
    await button(page, "Copy DID").click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/^did:zkjm:superj:[0-9a-fA-F]{40}$/);
  });

  test("TC-NAV-04 Download the App opens a QR code modal that can be closed", async ({ page }) => {
    await button(page, "Download the App").click();
    const heading = page.getByText("Open your phone camera and point it at the QR code.");
    await expect(heading).toBeVisible();
    await page.keyboard.press("Escape");
    if (await heading.isVisible()) await page.mouse.click(5, 5); // backdrop
    await expect(heading).toBeHidden();
  });

  test("TC-NAV-05 /OnBoarding redirects a logged-in user to Home", async ({ page }) => {
    await open(page, "/OnBoarding");
    await expect(page).toHaveURL(/\/Home$/);
  });

  test("TC-NAV-06 unknown routes show a not-found page", async ({ page }) => {
    test.fail(true, "BUG-03: unknown routes render an empty layout with no 404 message");
    await open(page, "/this-page-does-not-exist");
    await expect(page.getByText(/not found|404|doesn.t exist/i)).toBeVisible({ timeout: 10000 });
  });
});
