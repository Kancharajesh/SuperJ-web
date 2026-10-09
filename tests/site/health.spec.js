import { test, expect } from "@playwright/test";
import { open } from "../../utils/ui.js";

// Every logged-in desktop page loads without uncaught JS errors or 5xx
// responses from SuperJ's own APIs. TC-HLT-* in TEST_CASES.md.
const ROUTES = ["/Home", "/rewards", "/focus-group/discussions", "/profile", "/transaction-history", "/help-support", "/privacy-policy-sj", "/profile-edit"];

// React #418 (hydration mismatch) on pages that render dates.
const KNOWN = { "/profile": "BUG-05", "/transaction-history": "BUG-05" };

for (const route of ROUTES) {
  test(`TC-HLT-01 ${route} loads without JS errors or SuperJ 5xx responses`, async ({ page }) => {
    test.fail(!!KNOWN[route], `${KNOWN[route]}: React hydration error #418 on load`);
    const problems = [];
    page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
    page.on("response", (res) => {
      if (res.status() >= 500 && /(^|\.)superj\.app$/.test(new URL(res.url()).hostname)) problems.push(`${res.status()} ${res.url().split("?")[0]}`);
    });
    await open(page, route);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(new RegExp(`${route.replace(/[/-]/g, "\\$&")}$`));
    expect(problems).toEqual([]);
  });
}
