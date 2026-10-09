import { test, expect } from "@playwright/test";
import { button, open } from "../../utils/ui.js";

// Desktop Home survey feed. TC-HOME-* in TEST_CASES.md.
test.describe("Desktop Home", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/Home");
  });

  test("TC-HOME-01 shows the welcome heading and tagline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome to SuperJ!" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Answer surveys and win exciting rewards/ })).toBeVisible();
  });

  test("TC-HOME-02 survey cards show participants, reward, question count and Start Survey", async ({ page }) => {
    const starts = page.getByRole("button", { name: "Start Survey" });
    await expect(starts.first()).toBeVisible();
    expect(await starts.count()).toBeGreaterThan(0);
    await expect(page.getByText(/^\d+ people have taken this survey$/).first()).toBeVisible();
    await expect(page.getByText(/Earn \d+/).first()).toBeVisible();
    await expect(page.getByText(/^Answer \d+ questions & win an exciting reward!$/).first()).toBeVisible();
  });

  // Clicks Start Survey on a card but never the consent button, so no
  // survey is begun. A survey this account already started resumes at its
  // question screen instead of the preview.
  test("TC-HOME-03 Start Survey opens a preview matching the card, with consent notice", async ({ page }) => {
    const start = page.getByRole("button", { name: "Start Survey" }).first();
    const card = start.locator("xpath=ancestor::div[.//*[self::h1 or self::h2 or self::h3]][1]");
    const title = (await card.getByRole("heading").first().innerText()).trim();
    const reward = (await card.getByText(/Earn \d+/).innerText()).match(/\d+/)[0];
    await start.click();
    await expect(page).toHaveURL(/\/(normal-survey-preview|survey-screen)\/[0-9a-f]{24}$/);
    if (/survey-screen/.test(page.url())) {
      await expect(page.getByText(/^\d+\/\d+$/)).toBeVisible();
      await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
      return;
    }
    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(page.getByText(`₹ ${reward} CASH REWARD`)).toBeVisible();
    await expect(page.getByText(/Estimated time/)).toBeVisible();
    await expect(page.getByText("By clicking start, I consent to answering this survey")).toBeVisible();
    await expect(page.getByRole("button", { name: "START SURVEY" })).toBeEnabled();
  });

  test("TC-HOME-04 /start-survey shows the sponsored study consent page", async ({ page }) => {
    await open(page, "/start-survey");
    await expect(page.getByRole("heading", { name: "The Karnataka" })).toBeVisible();
    await expect(page.getByText(/Your responses are completely anonymous/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Survey" })).toBeVisible();
  });
});
