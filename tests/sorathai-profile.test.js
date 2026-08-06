const test = require("node:test");
const assert = require("node:assert/strict");
const Profile = require("../sorathai-profile.js");

function memoryStorage(initial) {
  const values = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

test("validates real ISO dates and supported year bounds", () => {
  assert.equal(Profile.isValidISO("2000-01-31"), true);
  assert.equal(Profile.isValidISO("2000-04-31"), false);
  assert.equal(Profile.isValidISO("1899-12-31"), false);
  assert.equal(Profile.isValidISO("2100-01-01"), false);
  assert.equal(Profile.isValidISO("2000-1-01"), false);
});

test("handles Gregorian leap years strictly", () => {
  assert.equal(Profile.isValidISO("2000-02-29"), true);
  assert.equal(Profile.isValidISO("2024-02-29"), true);
  assert.equal(Profile.isValidISO("1900-02-29"), false);
  assert.equal(Profile.isValidISO("2023-02-29"), false);
});

test("converts legacy DDMMYYYY and ISO values", () => {
  assert.equal(Profile.toISO("29022024"), "2024-02-29");
  assert.equal(Profile.toLegacy("2024-02-29"), "29022024");
  assert.equal(Profile.toISO("31022024"), null);
});

test("generates deterministic, bounded powers", () => {
  assert.deepEqual(Profile.create("01011990"), Profile.create("1990-01-01"));
  assert.notDeepEqual(Profile.create("01011990"), Profile.create("02011990"));
  Object.values(Profile.create("01011990").powers).forEach((value) => {
    assert.ok(value >= 1 && value <= 100);
  });
});

test("persists, restores, and clears the versioned schema", () => {
  const storage = memoryStorage(), profile = Profile.create("1990-01-01");
  assert.equal(Profile.save(profile, storage), true);
  assert.deepEqual(Profile.restore(storage), profile);
  assert.equal(Profile.clear(storage), true);
  assert.equal(Profile.restore(storage), null);
});

test("handles corrupt and unavailable storage safely", () => {
  const corrupt = memoryStorage({ [Profile.STORAGE_KEY]: "{broken" });
  assert.equal(Profile.restore(corrupt), null);
  const unavailable = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  assert.equal(Profile.restore(unavailable), null);
  assert.equal(Profile.save(Profile.create("1990-01-01"), unavailable), false);
  assert.equal(Profile.clear(unavailable), false);
});

test("valid query wins, invalid query never falls back to stored data", () => {
  const storage = memoryStorage();
  Profile.save(Profile.create("1990-01-01"), storage);
  assert.equal(Profile.fromLocation("", storage).dob, "1990-01-01");
  assert.equal(Profile.fromLocation("?dob=29022024", storage).dob, "2024-02-29");
  assert.equal(Profile.fromLocation("?dob=not-a-date", storage), null);
});

test("generates reading URLs while preserving parameters and fragments", () => {
  const profile = Profile.create("2024-02-29");
  assert.equal(Profile.readingUrl("thai-astrology.html", profile), "thai-astrology.html?dob=29022024");
  assert.equal(Profile.readingUrl("mayan.html?ref=home#card", profile), "mayan.html?ref=home&dob=29022024#card");
  assert.equal(Profile.readingUrl("index.html", null), "index.html");
});
