require("dotenv").config();
const { defineConfig, devices } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "https://superj.app";

module.exports = defineConfig({
  testDir: "./tests",

  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["junit", { outputFile: "test-results/results.xml" }],
        ["json", { outputFile: "test-results/results.json" }],
      ]
    : [["html", { outputFolder: "playwright-report", open: "never" }]],

  timeout: 60000,
  // All specs authenticate the same hardcoded test phone number
  // (PHONE_NUMBER in .env). Running them concurrently races multiple
  // OTP requests/verifications against that one number and superj.app's
  // backend rejects the resulting overlap, so this suite must stay serial
  // until tests are updated to use distinct numbers per worker.
  workers: 1,
  retries: process.env.CI ? 1 : 0,

  expect: {
    timeout: 20000,
  },

  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: process.env.CI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      // superj.app serves a completely different funnel below its mobile
      // breakpoint (a "Start Now" -> WhatsApp OTP flow, see Mobile_login.js)
      // vs. the direct phone-input flow desktop uses (WelcomePage.js), so
      // each spec is only valid against the project it was written for.
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/*.spec.js"],
      testIgnore: ["**/mobile-*.spec.js"],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: ["**/mobile-*.spec.js"],
    },
  ],
});