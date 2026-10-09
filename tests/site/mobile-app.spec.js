import { test, expect } from "@playwright/test";
import { dismissPromos, open, tap } from "../../utils/ui.js";

// Logged-in mobile layout: Home, Highest Paying, Wallet, Profile, History,
// Help. TC-M* in TEST_CASES.md. Nothing here cashes out, redeems, saves an
// edit, starts a survey or confirms logout.
const labelled = (page, label) => page.getByRole("button").filter({ hasText: new RegExp(`^${label}$`) }).filter({ visible: true }).first();

test.describe("Mobile Home", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/Home");
    await dismissPromos(page);
  });

  test("TC-MHOME-01 top bar and bottom nav: profile icon, Home and Wallet", async ({ page }) => {
    await expect(page.getByAltText("profile icon")).toBeVisible();
    await expect(page.locator("a[href='/Home']")).toBeVisible();
    await expect(page.locator("a[href='/rewards']")).toBeVisible();
  });

  test("TC-MHOME-02 shows referral banner and survey sections", async ({ page }) => {
    await expect(page.getByText(/Refer the app for ₹\d+/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Refer now" })).toBeVisible();
    for (const section of ["Recommended for You", "Highest Paying", "Share & Earn"]) {
      await expect(page.getByRole("button", { name: section })).toBeVisible();
    }
  });

  test("TC-MHOME-03 bottom nav Wallet and Home switch pages", async ({ page }) => {
    await tap(page.locator("a[href='/rewards']"));
    await expect(page).toHaveURL(/\/rewards$/);
    await tap(page.locator("a[href='/Home']"));
    await expect(page).toHaveURL(/\/Home$/);
  });

  test("TC-MHOME-04 Highest Paying opens the See all list with sort options", async ({ page }) => {
    await tap(page.getByRole("button", { name: "Highest Paying" }));
    await expect(page).toHaveURL(/\/see-all\?title=Highest\+Paying$/);
    await expect(page.getByRole("button", { name: "High to Low" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Low to High" })).toBeVisible();
  });
});

test.describe("Mobile Highest Paying sort", () => {
  // Card text runs: title, "<n> min", participants, reward, tag.
  const rewards = async (page) => {
    const lines = (await page.locator("body").innerText()).split("\n").map((l) => l.trim());
    return lines.flatMap((l, i) => (/^\d+ min$/.test(lines[i - 2] || "") && /^\d+$/.test(l) ? [Number(l)] : []));
  };

  test.beforeEach(async ({ page }) => {
    await open(page, "/see-all?title=Highest+Paying");
    await expect(page.getByRole("button", { name: "High to Low" })).toBeVisible();
  });

  for (const [order, check] of [["High to Low", (a, b) => b - a], ["Low to High", (a, b) => a - b]]) {
    test(`TC-MHOME-05 ${order} orders surveys by reward`, async ({ page }) => {
      await tap(page.getByRole("button", { name: order }));
      await expect.poll(async () => (await rewards(page)).length).toBeGreaterThan(1);
      const shown = await rewards(page);
      expect(shown).toEqual([...shown].sort(check));
    });
  }
});

test.describe("Mobile Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/rewards");
    await dismissPromos(page);
    await expect(page.getByText("Wallet balance", { exact: true })).toBeVisible();
  });

  test("TC-MWAL-01 shows balance, non-zero cash-out minimum and Cash Out", async ({ page }) => {
    await expect(page.getByText(/^You have ₹\d+ in your Wallet!/)).toBeVisible();
    await expect(page.getByText(/minimum of ₹[1-9]\d* wallet balance to cash out/)).toBeVisible();
    await expect(labelled(page, "Cash Out")).toBeVisible();
  });

  test("TC-MWAL-02 Know more explains gift-card redemption with the same minimum", async ({ page }) => {
    const rule = (await page.getByText(/minimum of ₹\d+ wallet balance to cash out/).innerText()).match(/₹(\d+)/)[1];
    await tap(labelled(page, "Know more"));
    await expect(page.getByText("Redeem Gift Card", { exact: true })).toBeVisible();
    await expect(page.getByText(`You need a minimum Wallet Balance amount of ₹${rule} to redeem a Gift Card.`)).toBeVisible();
    await expect(page.getByText("Turn On Notifications", { exact: true })).toBeVisible();
  });

  test("TC-MWAL-03 View all gift cards opens the gift card list", async ({ page }) => {
    await tap(page.getByRole("button", { name: /View all gift cards/ }));
    await expect(page).toHaveURL(/\/rewards\/giftcards$/);
    await expect(page.getByRole("button", { name: /Sort/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /E-Gift Voucher|Rs \d+/ }).first()).toBeVisible();
  });

  test("TC-MWAL-04 Refer & Earn banner is shown", async ({ page }) => {
    await expect(page.getByText(/Refer & Earn Amazon Pay ₹\d+/)).toBeVisible();
  });
});

test.describe("Mobile Profile", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "/Home");
    await dismissPromos(page);
    await tap(page.getByAltText("profile icon"));
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("TC-MPRO-01 shows DID banner, referral program, shortcuts and personal info", async ({ page }) => {
    for (const text of ["This is your DID", "Refer & Earn Program!", "Refer a friend", "My History", "Personal Information", "Account"]) {
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    }
    for (const label of ["Gender", "Birth Year", "City"]) await expect(page.getByText(label, { exact: true })).toBeVisible();
  });

  test("TC-MPRO-02 Track Progress opens the referral FAQ", async ({ page }) => {
    await tap(page.getByRole("button", { name: /Track Progress/ }));
    await expect(page).toHaveURL(/\/friend-track-progress$/);
    await expect(page.getByText("Can I refer anybody and receive the referral reward?")).toBeVisible();
  });

  test("TC-MPRO-03 My History opens history with Transactions and Verifications tabs", async ({ page }) => {
    await tap(page.getByRole("button", { name: /My History/ }));
    await expect(page).toHaveURL(/\/transaction-history$/);
    await expect(page.getByRole("button", { name: "Transactions" })).toBeVisible();
    await tap(page.getByRole("button", { name: "Verifications" }));
    await expect(page.getByText(/^\d{1,2} [A-Z][a-z]{2}, \d{4}$/).first()).toBeVisible();
  });

  test("TC-MPRO-04 Edit opens the edit form with a 100-character optional email (not saved)", async ({ page }) => {
    await tap(page.getByText("Edit", { exact: true }));
    await expect(page).toHaveURL(/\/profile-edit$/);
    const email = page.getByPlaceholder("example@abc.com");
    await expect(email).toHaveAttribute("maxlength", "100");
    await expect(page.getByText("optional")).toBeVisible();
    await expect(page.getByText("Done", { exact: true })).toBeVisible();
  });

  test("TC-MPRO-05 Help and Support and Privacy Policy open their pages", async ({ page }) => {
    await tap(page.getByText("Help and Support", { exact: true }));
    await expect(page).toHaveURL(/\/help-support$/);
    await expect(page.getByText("FAQs")).toBeVisible();
    await page.goBack();
    await tap(page.getByText("Privacy Policy", { exact: true }));
    await expect(page).toHaveURL(/\/privacy-policy$/);
    await expect(page.getByText(/This Privacy Policy/).first()).toBeVisible();
  });

  test("TC-MPRO-06 Logout asks for confirmation and Cancel keeps the session", async ({ page }) => {
    await tap(page.getByText("Logout", { exact: true }));
    await expect(page.getByText("Sure you want to logout?")).toBeVisible();
    await tap(page.getByRole("button", { name: "Cancel" }));
    await expect(page.getByText("Sure you want to logout?")).toBeHidden();
    await expect(page).toHaveURL(/\/profile$/);
  });
});
