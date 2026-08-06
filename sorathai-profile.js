(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiProfile = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = 1;
  const STORAGE_KEY = "sorathai.profile.v1";

  function isValidISO(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1900 || year > 2099 || month < 1 || month > 12 || day < 1) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function toISO(value) {
    if (typeof value !== "string") return null;
    if (isValidISO(value)) return value;
    if (!/^\d{8}$/.test(value)) return null;
    const iso = value.slice(4) + "-" + value.slice(2, 4) + "-" + value.slice(0, 2);
    return isValidISO(iso) ? iso : null;
  }

  function toLegacy(value) {
    const iso = toISO(value);
    return iso ? iso.slice(8) + iso.slice(5, 7) + iso.slice(0, 4) : null;
  }

  function hash(text) {
    let value = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      value ^= text.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function score(iso, name) { return 1 + (hash(iso + ":" + name) % 100); }

  function create(dob) {
    const iso = toISO(dob);
    if (!iso) return null;
    return {
      version: VERSION,
      dob: iso,
      powers: {
        intuition: score(iso, "intuition"),
        vitality: score(iso, "vitality"),
        harmony: score(iso, "harmony"),
        focus: score(iso, "focus")
      }
    };
  }

  function validProfile(profile) {
    if (!profile || profile.version !== VERSION || !isValidISO(profile.dob) || !profile.powers) return false;
    return ["intuition", "vitality", "harmony", "focus"].every(function (key) {
      return Number.isInteger(profile.powers[key]) && profile.powers[key] >= 1 && profile.powers[key] <= 100;
    });
  }

  function save(profile, storage) {
    if (!validProfile(profile)) return false;
    try { (storage || localStorage).setItem(STORAGE_KEY, JSON.stringify(profile)); return true; } catch (_) { return false; }
  }

  function restore(storage) {
    try {
      const raw = (storage || localStorage).getItem(STORAGE_KEY);
      if (!raw) return null;
      const profile = JSON.parse(raw);
      return validProfile(profile) ? profile : null;
    } catch (_) { return null; }
  }

  function clear(storage) {
    try { (storage || localStorage).removeItem(STORAGE_KEY); return true; } catch (_) { return false; }
  }

  function fromParts(day, month, year) {
    const iso = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    return create(iso);
  }

  function fromLocation(search, storage) {
    const params = new URLSearchParams(search || "");
    if (params.has("dob")) {
      const profile = create(params.get("dob"));
      if (profile) save(profile, storage);
      return profile;
    }
    return restore(storage);
  }

  function readingUrl(path, profile) {
    if (!validProfile(profile)) return path;
    const split = path.split("#"), hashPart = split.length > 1 ? "#" + split.slice(1).join("#") : "";
    const querySplit = split[0].split("?"), params = new URLSearchParams(querySplit[1] || "");
    params.set("dob", toLegacy(profile.dob));
    return querySplit[0] + "?" + params.toString() + hashPart;
  }

  return { VERSION, STORAGE_KEY, isValidISO, toISO, toLegacy, create, fromParts, save, restore, clear, fromLocation, readingUrl };
});
