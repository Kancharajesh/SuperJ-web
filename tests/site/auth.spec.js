import { test, expect } from "@playwright/test";
import { PHONE_NUMBER } from "../../utils/config.js";
import { LOGGED_OUT, open } from "../../utils/ui.js";

// Logged-out desktop sign-in. TC-AUTH-* in TEST_CASES.md.
test.use({ storageState: LOGGED_OUT });

const phoneInput = (page) => page.getByLabel("phone-number-input").first();
const requestOtp = (page) => page.getByRole("button", { name: "Request OTP" }).first();

test.describe("Desktop sign-in", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/");
    await expect(phoneInput(page)).toBeVisible({ timeout: 60000 });
  });

  test("TC-AUTH-01 sign-in screen shows heading, +91 prefix, OTP hint and Request OTP", async ({ page }) => {
    await expect(page).toHaveTitle("Welcome to SuperJ");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByText("+91", { exact: true })).toBeVisible();
    await expect(page.getByText(/send you one time password \(OTP\)/)).toBeVisible();
    await expect(requestOtp(page)).toBeEnabled();
  });

  test("TC-AUTH-02 phone field ignores non-digit characters", async ({ page }) => {
    await phoneInput(page).pressSequentially("ab!@ c");
    await expect(phoneInput(page)).toHaveValue("");
  });

  test("TC-AUTH-03 phone field stops accepting input at its length limit", async ({ page }) => {
    await phoneInput(page).pressSequentially("98850608911234");
    expect((await phoneInput(page).inputValue()).replace(/\D/g, "").length).toBeLessThanOrEqual(10);
  });

  test("TC-AUTH-04 empty and short numbers show 'Please enter a valid phone number'", async ({ page }) => {
    await requestOtp(page).click();
    await expect(page.getByText("Please enter a valid phone number")).toBeVisible();
    await phoneInput(page).fill("12345");
    await requestOtp(page).click();
    await expect(page.getByText("Please enter a valid phone number")).toBeVisible();
    await expect(page).toHaveURL(/superj\.app\/$/);
  });

  // One test for the whole OTP screen so each run requests a single OTP.
  test("TC-AUTH-05 OTP screen: number shown, 6 boxes, resend countdown, wrong code rejected", async ({ page }) => {
    await phoneInput(page).fill(PHONE_NUMBER);
    await requestOtp(page).click();

    await expect(page).toHaveURL(new RegExp(`/verify-otp\\?phoneNumber=${PHONE_NUMBER}`));
    await expect(page.getByRole("heading", { name: "Enter OTP" })).toBeVisible();
    await expect(page.getByText(`+91 - ${PHONE_NUMBER}`)).toBeVisible();
    for (let i = 1; i <= 6; i++) await expect(page.getByLabel(`OTP digit ${i}`)).toHaveAttribute("maxlength", "1");
    const resend = page.getByRole("button", { name: /Resend OTP in \d+s/ });
    await expect(resend).toBeVisible();

    for (let i = 1; i <= 6; i++) await page.getByLabel(`OTP digit ${i}`).fill("0");
    await expect(page.getByText(/invalid otp/i)).toBeVisible();
    await expect(page).toHaveURL(/\/verify-otp/);
  });
});

test.describe("Protected routes while logged out", () => {
  for (const route of ["/Home", "/rewards", "/profile", "/transaction-history"]) {
    test(`TC-AUTH-06 ${route} redirects to sign-in`, async ({ page }) => {
      await open(page, route);
      await expect(page.getByLabel("phone-number-input").first()).toBeVisible({ timeout: 60000 });
      await expect(page).toHaveURL(/superj\.app\/$/);
    });
  }

  test("TC-AUTH-07 /focus-group/discussions and /profile-edit show no user data", async ({ page }) => {
    await open(page, "/focus-group/discussions");
    await expect(page.getByText("Discussions are not available for your account yet.")).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole("button", { name: "Start Discussion" })).toHaveCount(0);
    await open(page, "/profile-edit");
    await page.waitForTimeout(3000);
    await expect(page.getByText(/Gender|Birth Year|did:zkjm/)).toHaveCount(0);
  });

  for (const route of ["/focus-group/discussions", "/profile-edit"]) {
    test(`TC-AUTH-08 ${route} redirects to sign-in like other routes`, async ({ page }) => {
      test.fail(true, "BUG-02: logged-out users get the empty app shell instead of the sign-in redirect");
      await open(page, route);
      await expect(page.getByLabel("phone-number-input").first()).toBeVisible({ timeout: 15000 });
    });
  }
});
