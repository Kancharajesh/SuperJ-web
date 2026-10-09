import { test, expect } from "@playwright/test";
import { button, open } from "../../utils/ui.js";

// One end-to-end journey across every desktop module, in the order a real
// user moves through them: Home -> survey preview -> Wallet -> Discussions ->
// Profile -> Transaction History -> Help -> logout (cancelled). It reuses the
// logged-in session from tests/setup/auth.setup.js (desktop-site project) and
// captures backend health along the way.
//
// Read-only: it never cashes out, redeems, submits a survey, saves an edit,
// creates/deletes a discussion, or confirms logout. Per-case coverage lives
// in the other tests/site specs; this is the full-website smoke walk.
test("full website end-to-end journey (desktop, all modules)", async ({ page }) => {
  const apiErrors = [];
  const jsErrors = [];
  page.on("pageerror", (err) => jsErrors.push(err.message.split("\n")[0]));
  page.on("response", (res) => {
    const host = new URL(res.url()).hostname;
    if (res.status() >= 400 && /(^|\.)superj\.app$/.test(host)) {
      apiErrors.push(`${res.status()} ${res.request().method()} ${res.url().split("?")[0]}`);
    }
  });

  await test.step("Home: survey feed loads", async () => {
    await open(page, "/Home");
    await expect(page.getByRole("heading", { name: "Welcome to SuperJ!" })).toBeVisible();
    await expect(button(page, "Start Survey")).toBeVisible();
    await expect(page.getByText(/^\d+ people have taken this survey$/).first()).toBeVisible();
  });

  await test.step("Home: open a survey preview, then leave without starting it", async () => {
    await button(page, "Start Survey").click();
    await expect(page).toHaveURL(/\/(normal-survey-preview|survey-screen)\/[0-9a-f]{24}$/);
    // Leave the survey without answering; client-side routing makes goBack
    // unreliable here, so return to Home directly.
    await open(page, "/Home");
    await expect(page).toHaveURL(/\/Home$/);
  });

  await test.step("Wallet: balance, cash-out rule and gift cards", async () => {
    await open(page, "/rewards");
    await expect(page.getByText("Wallet balance", { exact: true })).toBeVisible();
    await expect(page.getByText(/^You have ₹\d+ in your Wallet!/)).toBeVisible();
    await expect(page.getByText(/minimum of ₹[1-9]\d* wallet balance to cash out/)).toBeVisible();
    await expect(button(page, "Cash Out")).toBeEnabled(); // never clicked
    await button(page, "Know more").click();
    await expect(page.getByText("How to withdraw your cash?").first()).toBeVisible();
  });

  await test.step("Discussions: moderator tabs render", async () => {
    await open(page, "/focus-group/discussions");
    await expect(page.getByRole("heading", { name: "Discussions!" })).toBeVisible();
    for (const tab of ["Live", "Scheduled", "New"]) {
      await expect(page.getByRole("button").filter({ hasText: new RegExp(`^${tab}$`) }).first()).toBeVisible();
    }
  });

  await test.step("Profile: DID and personal information", async () => {
    await open(page, "/profile");
    await expect(page.getByText(/^did:zkjm:superj:[0-9a-fA-F]{40}$/)).toBeVisible();
    for (const label of ["Gender", "Birth Year", "City"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  await test.step("Transaction History: entries newest first", async () => {
    await open(page, "/transaction-history");
    await expect(page.getByText("Transaction History")).toBeVisible();
    const dates = (await page.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/).allInnerTexts()).map((d) => new Date(d).getTime());
    expect(dates.length).toBeGreaterThan(0);
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  await test.step("Help & Support: FAQs and terms link", async () => {
    await open(page, "/help-support");
    await expect(page.getByText("FAQs")).toBeVisible();
    await page.getByText("Is my personal data secure?").click();
    await expect(page.getByText(/We take your privacy and security seriously/)).toBeVisible();
  });

  await test.step("Logout dialog opens and Cancel keeps the session", async () => {
    await open(page, "/profile");
    await button(page, "Logout").click();
    await expect(page.getByText("Sure you want to logout?")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Sure you want to logout?")).toBeHidden();
    await expect(page).toHaveURL(/\/profile$/);
  });

  // No SuperJ backend call returned a 4xx/5xx during the whole walk.
  expect(apiErrors, `SuperJ API errors: ${apiErrors.join(", ")}`).toEqual([]);
  // React #418 on /profile and /transaction-history is tracked as BUG-05; the
  // rest of the journey should stay error-free.
  const unexpected = jsErrors.filter((m) => !/#418|Minified React error #418/.test(m));
  expect(unexpected, `Unexpected JS errors: ${unexpected.join(", ")}`).toEqual([]);
});
