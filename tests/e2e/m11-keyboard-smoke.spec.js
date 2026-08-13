const { test, expect } = require("@playwright/test");

async function tabUntil(page, predicate, limit = 40) {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => ({
      id: document.activeElement && document.activeElement.id,
      tag: document.activeElement && document.activeElement.tagName,
      href: document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("href"),
      classes: document.activeElement && document.activeElement.className,
    }));
    if (predicate(active)) return active;
  }
  throw new Error("keyboard target not reached within tab limit");
}

test("Home primary journey is reachable by keyboard and exposes visible focus", async ({ page }) => {
  await page.goto("/index.html");

  await tabUntil(page, (active) => active.id === "birth-day");
  await expect(page.locator("#birth-day")).toBeFocused();
  const dayFocus = await page.locator("#birth-day").evaluate((node) => ({
    width: getComputedStyle(node).outlineWidth,
    style: getComputedStyle(node).outlineStyle,
  }));
  expect(parseFloat(dayFocus.width)).toBeGreaterThan(0);
  expect(dayFocus.style).not.toBe("none");

  await page.selectOption("#birth-day", "1");
  await page.keyboard.press("Tab");
  await expect(page.locator("#birth-month")).toBeFocused();
  await page.selectOption("#birth-month", "1");
  await page.keyboard.press("Tab");
  await expect(page.locator("#birth-year")).toBeFocused();
  await page.selectOption("#birth-year", "1990");

  const submit = await tabUntil(page, (active) => active.tag === "BUTTON" && String(active.classes).includes("primary"));
  expect(submit.tag).toBe("BUTTON");
  const submitFocus = await page.locator("button.primary").evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(parseFloat(submitFocus)).toBeGreaterThan(0);
  await page.keyboard.press("Enter");

  await expect(page.locator("#profile-result")).toBeVisible();
  await expect(page).toHaveURL(/dob=01011990/);

  await tabUntil(page, (active) => String(active.classes).includes("science-card"));
  const science = page.locator(".science-card:focus");
  await expect(science).toHaveCount(1);
  const scienceFocus = await science.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(parseFloat(scienceFocus)).toBeGreaterThan(0);
  await page.keyboard.press("Enter");
  await expect(page.locator(".explore-sheet")).toBeVisible();
});

test("Combined Profile primary actions remain native keyboard controls", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => {
    let profile = SorathaiProfile.create("1990-01-01");
    profile = SorathaiProfile.markScienceExplored(profile, "thai");
    profile = SorathaiProfile.markScienceExplored(profile, "western");
    SorathaiProfile.save(profile);
  });
  await page.goto("/profile.html?dob=01011990");
  await expect(page.locator("#combined-result")).toBeVisible();
  await expect(page.locator("#export-profile")).toHaveJSProperty("tagName", "BUTTON");
  await expect(page.locator("#return-base")).toHaveJSProperty("tagName", "A");

  await tabUntil(page, (active) => active.id === "export-profile");
  await expect(page.locator("#export-profile")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#return-base")).toBeFocused();
});
