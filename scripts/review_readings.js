"use strict";

const assert = require("node:assert/strict");
global.window = global;
global.SorathaiProfile = require("../sorathai-profile.js");
require("../horoscope-data.js");
global.SorathaiContent = require("../sorathai-content.js");
const Deep = require("../sorathai-deep-content.js");

const DOBS = ["1990-01-01", "1995-06-15", "2000-02-29", "1985-12-31"];
const FORBIDDEN_NATAL = /(ช่วงนี้|เร็ว\s*ๆ\s*นี้|กำลังจะ|ปีนี้|เดือนนี้|จะได้รับเงิน|จะมีคนเข้ามา|โชคลาภกำลัง|โรคไต|ฮอร์โมน|โรคกระดูก|ข้อเสื่อม)/;

function text(sections) {
  assert.ok(Array.isArray(sections) && sections.length >= 4, "reading must contain meaningful sections");
  const value = sections.map((item) => `${item.title} ${item.body}`).join(" ");
  assert.ok(value.length > 300, "reading is unexpectedly thin");
  return value;
}

function cycleValues(dob) {
  const [y, m, d] = dob.split("-").map(Number);
  const reference = Date.UTC(2026, 7, 8), born = Date.UTC(y, m - 1, d);
  const days = Math.floor((reference - born) / 86400000);
  return {
    physical: Math.round(Math.sin(2 * Math.PI * days / 23) * 100),
    emotional: Math.round(Math.sin(2 * Math.PI * days / 28) * 100),
    intellectual: Math.round(Math.sin(2 * Math.PI * days / 33) * 100)
  };
}

function review(dob) {
  const [y, m, d] = dob.split("-").map(Number), profile = SorathaiProfile.create(dob), lifePath = SorathaiProfile.deriveBaseCard(profile).lifePath;
  const readings = {
    thai: SorathaiContent.thaiReading(HR.THAI_DAY[new Date(y, m - 1, d).getDay()]),
    western: SorathaiContent.westernReading(HR.WESTERN[HR.getWesternIdx(d, m)]),
    chinese: SorathaiContent.chineseReading(HR.CHINESE[HR.getChineseIdx(y)]),
    numerology: SorathaiContent.numerologyReading(lifePath, HR.NUMEROLOGY[lifePath] || HR.NUMEROLOGY[1]),
    mayan: Deep.mayanReading(HR.getMayan(d, m, y)),
    biorhythm: Deep.biorhythmReading(cycleValues(dob)),
    nakshatra: Deep.nakshatraReading(HR.getNakshatra(d, m, y)),
    celtic: Deep.celticReading(HR.getCeltic(d, m))
  };
  Object.entries(readings).forEach(([science, sections]) => {
    const value = text(sections);
    if (science !== "biorhythm") assert.doesNotMatch(value, FORBIDDEN_NATAL, `${dob} ${science} contains unsupported temporal/medical wording`);
    if (science === "biorhythm") {
      assert.match(value, /23 วัน/); assert.match(value, /28 วัน/); assert.match(value, /33 วัน/);
    }
    process.stdout.write(`review-ok ${dob} ${science}\n`);
  });
}

DOBS.forEach(review);
process.stdout.write(`reviewed ${DOBS.length * 8} DOB/science combinations\n`);
