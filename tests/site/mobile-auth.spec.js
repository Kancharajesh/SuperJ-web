import { test, expect } from "@playwright/test";
import { PHONE_NUMBER } from "../../utils/config.js";
import { LOGGED_OUT, open, tap } from "../../utils/ui.js";

// Logged-out mobile funnel: landing -> phone -> WhatsApp OTP. TC-MAUTH-* in TEST_CASES.md.
test.use({ storageState: LOGGED_OUT });

const startNow = (page) => page.getByRole("button", { name: "Start Now" });
const phone = (page) => page.getByPlaceholder("Phone number");
const cont = (page) => page.getByRole("button", { name: "Continue" });

test.describe("Mobile sign-in", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/");
    await expect(startNow(page)).toBeVisible({ timeout: 60000 });
  });

  test("TC-MAUTH-01 landing shows welcome copy, earning pitch, Download App and Start Now", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Welcome to\s*Super J/ })).toBeVisible();
    await expect(page.getByText(/Answer Surveys & earn upto/)).toBeVisible();
    await expect(page.getByText("₹500 every month!")).toBeVisible();
    await expect(page.getByRole("button", { name: /Download App/ })).toBeVisible();
    for (const lang of ["English tag", "Hindi tag", "Tamil tag"]) await expect(page.getByAltText(lang)).toBeAttached();
  });

  test("TC-MAUTH-02 Start Now opens the phone screen", async ({ page }) => {
    await tap(startNow(page));
    await expect(page).toHaveURL(/\/Login$/);
    await expect(page).toHaveTitle("Login | SuperJ");
    await expect(page.getByRole("heading", { name: "Your Phone Number" })).toBeVisible();
    await expect(page.getByText("+91", { exact: true })).toBeVisible();
    await expect(cont(page)).toBeVisible();
  });

  test("TC-MAUTH-03 empty and short numbers show 'Please enter a valid phone number'", async ({ page }) => {
    await tap(startNow(page));
    await tap(cont(page));
    await expect(page.getByText("Please enter a valid phone number")).toBeVisible();
    await phone(page).fill("12345");
    await tap(cont(page));
    await expect(page.getByText("Please enter a valid phone number")).toBeVisible();
    await expect(page).toHaveURL(/\/Login$/);
  });

  test("TC-MAUTH-04 phone field ignores letters", async ({ page }) => {
    await tap(startNow(page));
    await phone(page).pressSequentially("abc");
    await expect(phone(page)).toHaveValue("");
  });

  // One test for the OTP screen so each run requests a single WhatsApp OTP.
  test("TC-MAUTH-05 OTP screen: WhatsApp copy, retry countdown, wrong code rejected, Back", async ({ page }) => {
    await tap(startNow(page));
    await phone(page).fill(PHONE_NUMBER);
    await tap(cont(page));

    await expect(page).toHaveURL(new RegExp(`/OTP\\?phoneNumber=${PHONE_NUMBER}`));
    await expect(page.getByRole("heading", { name: "Confirm Your Number" })).toBeVisible();
    await expect(page.getByText("Enter the Code sent on WhatsApp")).toBeVisible();
    await expect(page.getByText(/^\+91 \d{5} \d{5}$/)).toBeVisible();
    await expect(page.getByText(/Retry in 00:\d{2}/)).toBeVisible();
    const code = page.getByLabel("Enter the 6 digit code");
    await expect(code).toHaveAttribute("maxlength", "6");

    await code.fill("000000");
    await expect(page.getByText(/valid otp/i)).toBeVisible();
    await expect(page).toHaveURL(/\/OTP/);

    await tap(page.getByRole("button", { name: "Back" }));
    await expect(page).toHaveURL(/\/Login$/);
  });
});
