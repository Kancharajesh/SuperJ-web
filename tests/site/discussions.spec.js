import { test, expect } from "@playwright/test";
import { open } from "../../utils/ui.js";

// Tab and menu buttons include icon text in their accessible names.
const labelled = (page, label) => page.getByRole("button").filter({ hasText: new RegExp(`^${label}$`) }).first();

// Desktop Discussions. TC-DIS-* in TEST_CASES.md. The test account has
// moderator access: nothing here starts, creates or deletes a discussion.
test.describe("Desktop Discussions", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/focus-group/discussions");
    await expect(page.getByRole("heading", { name: "Discussions!" })).toBeVisible();
  });

  test("TC-DIS-01 shows Moderator View with Live, Scheduled and New tabs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Discussions!" })).toBeVisible();
    for (const tab of ["Live", "Scheduled", "New"]) await expect(labelled(page, tab)).toBeVisible();
  });

  test("TC-DIS-02 Live lists discussions with time slot and Start Discussion, or none", async ({ page }) => {
    // Close any open invite panel first
    const closeBtn = page.getByRole("button").filter({ hasText: "Close" }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    await labelled(page, "Live").click();
    const start = labelled(page, "Start Discussion");
    if (await start.count()) {
      await expect(page.getByText(/\d{1,2}:\d{2} [ap]m – \d{1,2}:\d{2} [ap]m/).first()).toBeVisible();
    } else {
      await expect(page.getByText("No live sessions right now")).toBeVisible();
    }
  });

  test("TC-DIS-03 Scheduled lists upcoming discussions or an empty-state message", async ({ page }) => {
    // Close any open invite panel first
    const closeBtn = page.getByRole("button").filter({ hasText: "Close" }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    await labelled(page, "Scheduled").click();
    await expect(page.getByText("No upcoming discussions at the moment.").or(page.getByText(/\d{1,2}:\d{2} [ap]m/).first())).toBeVisible();
  });

  test("TC-DIS-04 New opens the Create New Discussion form (not submitted)", async ({ page }) => {
    await labelled(page, "New").click();
    await expect(page.getByText("Create New Discussion")).toBeVisible();
    for (const label of ["Discussion Title", "Description", "Discussion type", "Max Spots", "Date", "Time", "Camera required"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByPlaceholder('e.g. "Brainstorming Session"')).toBeEditable();
    await expect(page.getByPlaceholder("Max 10")).toBeEditable();
    await expect(page.getByRole("button", { name: "Create Discussion" })).toBeVisible();
  });

  // Opens the room's pre-join lobby only; "Join Discussion" is never pressed.
  test("TC-DIS-05 a live room opens its pre-join lobby with link and device setup", async ({ page }) => {
    const room = page.getByRole("button").filter({ hasText: /Group Discussion\s*Live/ }).first();
    test.skip(!(await room.count()), "no live room today");
    await room.click();
    await expect(page.getByText("How it works?")).toBeVisible();
    await expect(page.getByText(/^https:\/\/superj\.app\/fg\//)).toBeVisible();
    for (const setting of ["Microphone", "Camera", "Recording"]) await expect(page.getByText(setting, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Join Discussion" })).toBeVisible();
  });
});
