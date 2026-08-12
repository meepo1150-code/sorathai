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

test("legacy emoji are visually suppressed in science entry, drawer, and Thai result seals", async ({ page }) => {
  await page.goto("/thai-astrology.html");
  const entry = page.locator(".ep");
  await expect(entry).toBeVisible();
  const entryPresentation = await entry.evaluate((node) => ({
    fontSize: getComputedStyle(node).fontSize,
    mark: getComputedStyle(node, "::before").content,
  }));
  expect(entryPresentation.fontSize).toBe("0px");
  expect(entryPresentation.mark).toContain("☉");

  await page.evaluate(() => window.openDrw());
  const drawerIcons = page.locator(".dico");
  await expect(drawerIcons.first()).toBeVisible();
  const drawerPresentation = await drawerIcons.evaluateAll((nodes) => nodes.map((node) => ({
    fontSize: getComputedStyle(node).fontSize,
    mark: getComputedStyle(node, "::before").content,
  })));
  expect(drawerPresentation.every((item) => item.fontSize === "0px")).toBe(true);
  expect(drawerPresentation.every((item) => !/[🔮🐉🔢🌀📈✨🌿💭]/u.test(item.mark))).toBe(true);

  await page.goto("/thai-astrology.html?dob=01011990");
  await expect(page.locator("body")).toHaveAttribute("data-reading-key", "thai-monday");
  const planet = await page.locator("#sc-orb").evaluate((node) => ({
    fontSize: getComputedStyle(node).fontSize,
    mark: getComputedStyle(node, "::after").content,
  }));
  expect(planet.fontSize).toBe("0px");
  expect(planet.mark).toContain("☾");
});

test("dream UI uses Sorathai text marks instead of visible pictographic emoji", async ({ page }) => {
  await page.goto("/dream.html");
  const hero = await page.locator(".hero-ico").evaluate((node) => ({
    fontSize: getComputedStyle(node).fontSize,
    mark: getComputedStyle(node, "::before").content,
  }));
  expect(hero.fontSize).toBe("0px");
  expect(hero.mark).toContain("☾");

  const chips = await page.locator(".chip[data-v]").evaluateAll((nodes) => nodes.map((node) => ({
    fontSize: getComputedStyle(node).fontSize,
    label: getComputedStyle(node, "::after").content,
  })));
  expect(chips.length).toBeGreaterThan(0);
  expect(chips.every((item) => item.fontSize === "0px" && item.label !== "none")).toBe(true);
});
