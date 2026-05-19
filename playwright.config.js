const { defineConfig, devices } = require("@playwright/test");

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
  workers: process.env.CI ? 2 : 2,
  retries: process.env.CI ? 1 : 0,

  expect: {
    timeout: 20000,
  },

  use: {
    headless: true,
    trace: process.env.CI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/mobile_*.spec.js"],
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: ["**/mobile_*.spec.js"],
    },
  ],
});