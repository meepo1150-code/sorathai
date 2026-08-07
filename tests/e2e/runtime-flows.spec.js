const { test, expect } = require("@playwright/test");

const sciences = [
  ["thai", "thai-astrology.html"],
  ["western", "western-astrology.html"],
  ["chinese", "chinese-astrology.html"],
  ["numerology", "numerology.html"],
  ["mayan", "mayan.html"],
  ["biorhythm", "biorhythm.html"],
  ["nakshatra", "nakshatra.html"],
  ["celtic", "celtic.html"],
];
const focuses = ["identity", "love", "career", "challenge"];

function failOnPageErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error));
  return () => expect(errors, errors.map(String).join("\n")).toEqual([]);
}

async function expectReading(page, path, focus) {
  const query = new URLSearchParams({ dob: "01011990" });
  if (focus !== undefined) query.set("focus", focus);
  await page.goto(`/${path}?${query}`);
  await expect(page.locator("#s-result")).toBeVisible();
  await expect(page.locator("#rh-ttl")).not.toHaveText("");
  await expect(page.locator("#rdgs .rdg").first()).toBeVisible();
  await expect(page).toHaveURL(/dob=01011990/);
}

test("home creates and restores the Base Destiny Card", async ({ page }) => {
  const assertNoErrors = failOnPageErrors(page);
  await page.goto("/index.html");
  await expect(page.locator("#birth-form")).toBeVisible();
  await page.selectOption("#birth-day", "1");
  await page.selectOption("#birth-month", "1");
  await page.selectOption("#birth-year", "1990");
  await page.locator("#birth-form").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#profile-result")).toBeVisible();
  await expect(page).toHaveURL(/dob=01011990/);
  await page.reload();
  await expect(page.locator("#profile-result")).toBeVisible();
  assertNoErrors();
});

for (const [id, path] of sciences) {
  test(`${id} renders direct, focused, and returns to its Base Card`, async ({ page }) => {
    const assertNoErrors = failOnPageErrors(page);
    await expectReading(page, path);
    await expectReading(page, path, "invalid");
    await expect(page.locator(".focus-context")).toHaveCount(0);
    for (const focus of focuses) {
      await page.goto("/index.html?dob=01011990#profile-result");
      await page.locator(`a[data-science-id="${id}"]`).click();
      await expect(page.locator(".explore-sheet")).toBeVisible();
      await page.locator(`[data-focus="${focus}"]`).click();
      await expect(page.locator("#s-result")).toBeVisible();
      await expect(page.locator("#rh-ttl")).not.toHaveText("");
      await expect(page).toHaveURL(new RegExp(`dob=01011990.*focus=${focus}`));
    }
    await page.locator("#logo-link").click();
    await expect(page).toHaveURL(/index\.html\?dob=01011990(?:&focus=(?:identity|love|career|challenge))?#profile-result/);
    await expect(page.locator("#profile-result")).toBeVisible();
    assertNoErrors();
  });
}

test("RPG choice, science links, history, and Combined Profile retain progress", async ({ page }) => {
  const assertNoErrors = failOnPageErrors(page);
  await page.goto("/index.html?dob=01011990#profile-result");
  await page.locator('a[data-science-id="thai"]').click();
  await expect(page.locator(".explore-sheet")).toBeVisible();
  await page.locator('[data-focus="identity"]').click();
  await expect(page.locator("#s-result")).toBeVisible();
  await expect(page).toHaveURL(/dob=01011990.*focus=identity/);

  await page.locator('#rel-g a[href*="western-astrology.html"]').click();
  await expect(page.locator("#s-result")).toBeVisible();
  await expect(page).toHaveURL(/western-astrology\.html\?dob=01011990.*focus=identity/);
  await page.reload();
  await expect(page.locator("#s-result")).toBeVisible();

  await page.locator(".combined-entry").click();
  await expect(page.locator("#combined-result")).toBeVisible();
  await expect(page.locator("#progress-text")).toContainText("2 จาก 8");
  await expect(page).toHaveURL(/dob=01011990/);
  await page.locator("#return-base").click();
  await expect(page.locator("#profile-result")).toBeVisible();
  await expect(page.locator("#combined-profile")).toContainText("2/8");

  await page.goBack();
  await expect(page.locator("#combined-result")).toBeVisible();
  await page.goForward();
  await expect(page.locator("#profile-result")).toBeVisible();
  assertNoErrors();
});
