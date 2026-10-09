const path = require("path");

// Saved sessions written by tests/setup/auth.setup.js and reused by tests/site.
const AUTH_DIR = path.join(__dirname, "..", "playwright", ".auth");
const DESKTOP_STATE = path.join(AUTH_DIR, "desktop.json");
const MOBILE_STATE = path.join(AUTH_DIR, "mobile.json");
const LOGGED_OUT = { cookies: [], origins: [] };

// superj.app stacks an invisible <input switch> (an iOS haptic-feedback
// trick) over many buttons and nav links, mostly on the mobile layout.
// Playwright's normal click refuses because that overlay "intercepts
// pointer events"; a real tap lands on it and still works. force: true
// clicks at the element's centre the same way a finger does.
async function tap(locator) {
  await locator.waitFor({ state: "visible" });
  await locator.scrollIntoViewIfNeeded(); // force skips Playwright's own scrolling
  await locator.click({ force: true });
}

// Buttons carry icon alt text in their accessible name ("edit Edit"), so
// exact role names miss them; match on the visible label instead.
function button(page, label) {
  const pattern = label instanceof RegExp ? label : new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return page.getByRole("button", { name: pattern }).filter({ visible: true }).first();
}

async function open(page, route) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
}

// Mobile shows one-off promos ("Withdraw Faster!") over pages; close any
// that are up so they don't cover what a test is checking.
async function dismissPromos(page) {
  const gotIt = page.getByRole("button", { name: /Awesome, Got it/ });
  if (await gotIt.isVisible().catch(() => false)) await tap(gotIt);
}

module.exports = { DESKTOP_STATE, MOBILE_STATE, LOGGED_OUT, tap, button, open, dismissPromos };
