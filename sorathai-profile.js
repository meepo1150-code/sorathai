(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiProfile = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = 2;
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

  const LIFE_ARCHETYPES = { 1: "ผู้ริเริ่ม", 2: "ผู้ประสาน", 3: "นักสร้างสรรค์", 4: "ผู้วางรากฐาน", 5: "นักสำรวจ", 6: "ผู้ดูแล", 7: "นักค้นความหมาย", 8: "ผู้บริหารพลัง", 9: "ผู้แบ่งปัน", 11: "ผู้จุดประกาย", 22: "ผู้สร้างภาพใหญ่" };
  const POWER_LABELS = { intuition: "สัญชาตญาณ", vitality: "แรงขับ", harmony: "ความกลมกลืน", focus: "สมาธิ" };

  function lifePath(iso) {
    const valid = toISO(iso);
    if (!valid) return null;
    let value = valid.replace(/-/g, "").split("").reduce(function (sum, digit) { return sum + Number(digit); }, 0);
    while (value > 9 && value !== 11 && value !== 22) {
      value = String(value).split("").reduce(function (sum, digit) { return sum + Number(digit); }, 0);
    }
    return value;
  }

  function deriveBaseCard(profile) {
    if (!validProfile(profile)) return null;
    const number = lifePath(profile.dob);
    const powers = Object.keys(POWER_LABELS).map(function (key) {
      return { key: key, label: POWER_LABELS[key], value: profile.powers[key] };
    });
    return { dob: profile.dob, lifePath: number, archetype: LIFE_ARCHETYPES[number], powers: powers };
  }

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
      },
      exploredSciences: [],
      lastFocus: null
    };
  }

  const FOCUS_VALUES = Object.freeze(["identity", "love", "career", "challenge"]);
  function isValidFocus(value) { return FOCUS_VALUES.indexOf(value) !== -1; }
  function normaliseSciences(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(function (id, index) {
      return typeof id === "string" && /^[a-z0-9-]+$/.test(id) && value.indexOf(id) === index;
    });
  }
  function migrate(profile) {
    if (!profile || !isValidISO(profile.dob) || !profile.powers) return null;
    const migrated = {
      version: VERSION,
      dob: profile.dob,
      powers: profile.powers,
      exploredSciences: normaliseSciences(profile.exploredSciences),
      lastFocus: isValidFocus(profile.lastFocus) ? profile.lastFocus : null
    };
    return validProfile(migrated) ? migrated : null;
  }

  function validProfile(profile) {
    if (!profile || profile.version !== VERSION || !isValidISO(profile.dob) || !profile.powers || !Array.isArray(profile.exploredSciences) || (profile.lastFocus !== null && !isValidFocus(profile.lastFocus))) return false;
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
      const profile = migrate(JSON.parse(raw));
      if (profile && JSON.parse(raw).version !== VERSION) save(profile, storage);
      return profile;
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
      const fresh = create(params.get("dob"));
      const stored = restore(storage);
      const profile = fresh && stored && stored.dob === fresh.dob ? stored : fresh;
      if (profile) save(profile, storage);
      return profile;
    }
    return restore(storage);
  }

  function readingUrl(path, profile, focus) {
    if (!validProfile(profile)) return path;
    const split = path.split("#"), hashPart = split.length > 1 ? "#" + split.slice(1).join("#") : "";
    const querySplit = split[0].split("?"), params = new URLSearchParams(querySplit[1] || "");
    params.set("dob", toLegacy(profile.dob));
    if (isValidFocus(focus)) params.set("focus", focus);
    else params.delete("focus");
    return querySplit[0] + "?" + params.toString() + hashPart;
  }

  function homeUrl(profile, focus) {
    return readingUrl("index.html#profile-result", profile, focus);
  }

  function markScienceExplored(profile, scienceId, focus) {
    const next = migrate(profile);
    if (!next || typeof scienceId !== "string" || !/^[a-z0-9-]+$/.test(scienceId)) return next;
    if (next.exploredSciences.indexOf(scienceId) === -1) next.exploredSciences.push(scienceId);
    if (isValidFocus(focus)) next.lastFocus = focus;
    return next;
  }

  return { VERSION, STORAGE_KEY, FOCUS_VALUES, isValidFocus, isValidISO, toISO, toLegacy, create, migrate, validProfile, fromParts, save, restore, clear, fromLocation, readingUrl, homeUrl, markScienceExplored, lifePath, deriveBaseCard };
});
