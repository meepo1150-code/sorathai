const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  outputDir: "test-results",
  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
