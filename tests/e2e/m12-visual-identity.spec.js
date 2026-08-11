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

const zodiacKeys = [
  "capricorn", "aquarius", "pisces", "aries", "taurus", "gemini",
  "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius",
];

test("Base Destiny Card exposes stable presentation identity without changing profile contract", async ({ page }) => {
  await page.goto("/index.html?dob=01011990#profile-result");
  const card = page.locator("#destiny-card");
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-base-element", /^(earth|water|fire|air)$/);
  await expect(card).toHaveAttribute("data-base-sign", new RegExp(`^(${zodiacKeys.join("|")})$`));
  await expect(card).toHaveAttribute("data-base-archetype", /^life-(?:[1-9]|11|22)$/);
  await expect(card).toHaveAttribute("data-base-variant", /^[1-6]$/);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("sorathai.profile.v1")));
  expect(Object.keys(stored).sort()).toEqual(["dob", "exploredSciences", "lastFocus", "powers", "version"].sort());
  expect(stored.dob).toBe("1990-01-01");
});

for (const [id, path] of sciences) {
  test(`${id} exposes deterministic M12 reading identity`, async ({ page }) => {
    await page.goto(`/${path}?dob=01011990`);
    await expect(page.locator("#s-result")).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-reading-science", id);
    await expect(page.locator("body")).toHaveAttribute("data-reading-variant", /^(?:[1-9]|1[0-2])$/);
    await expect(page.locator("body")).toHaveAttribute("data-reading-key", new RegExp(`^${id}-`));
  });
}

test("Chinese reading repairs legacy-schema values without mutating SEO metadata", async ({ page }) => {
  await page.goto("/chinese-astrology.html?dob=01011990");
  await expect(page.locator("#s-result")).toBeVisible();
  await expect(page.locator("#rh-ttl")).not.toHaveText("");
  await expect(page.locator("#s-result")).not.toContainText(/undefined/i);
  await expect(page.locator("#fc1")).not.toHaveText("");
  await expect(page.locator("#ss1")).not.toHaveText("");
  await expect(page).toHaveTitle("โหราศาสตร์จีน: นักษัตร ธาตุ และหยินหยาง — Sorathai");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sorathai.pages.dev/chinese-astrology.html");
});
