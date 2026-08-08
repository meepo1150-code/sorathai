(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiCombined = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const ORDER = Object.freeze(["thai", "western", "chinese", "numerology", "mayan", "biorhythm", "nakshatra", "celtic"]);
  const ALIASES = Object.freeze({ west: "western", chin: "chinese", num: "numerology", bio: "biorhythm", naksh: "nakshatra" });
  const SCIENCES = Object.freeze({
    thai: { name: "โหราศาสตร์ไทย", href: "thai-astrology.html" }, western: { name: "โหราศาสตร์ตะวันตก", href: "western-astrology.html" },
    chinese: { name: "โหราศาสตร์จีน", href: "chinese-astrology.html" }, numerology: { name: "เลขศาสตร์", href: "numerology.html" },
    mayan: { name: "ปฏิทินมายา", href: "mayan.html" }, biorhythm: { name: "ไบโอริทึม", href: "biorhythm.html" },
    nakshatra: { name: "ดาวฤกษ์อินเดีย", href: "nakshatra.html" }, celtic: { name: "ต้นไม้เคลต์", href: "celtic.html" }
  });
  const THEMES = Object.freeze({
    initiative: "การริเริ่ม", stability: "ความมั่นคง", adaptability: "การปรับตัว", sensitivity: "ความละเอียดอ่อน",
    analysis: "การวิเคราะห์", expression: "การแสดงออก", responsibility: "ความรับผิดชอบ", independence: "ความเป็นอิสระ",
    connection: "การเชื่อมโยง", transformation: "การเปลี่ยนผ่าน"
  });
  const MAPS = Object.freeze({
    thai: [["initiative", "expression"], ["sensitivity", "connection"], ["adaptability", "expression"], ["analysis", "adaptability"], ["responsibility", "stability"], ["connection", "sensitivity"], ["stability", "responsibility"]],
    western: { "ไฟ": ["initiative", "expression"], "ดิน": ["stability", "responsibility"], "ลม": ["adaptability", "connection"], "น้ำ": ["sensitivity", "transformation"] },
    chinese: [["initiative", "adaptability"], ["stability", "responsibility"], ["initiative", "independence"], ["sensitivity", "connection"], ["transformation", "expression"], ["analysis", "transformation"], ["independence", "expression"], ["connection", "sensitivity"], ["adaptability", "analysis"], ["responsibility", "expression"], ["connection", "stability"], ["responsibility", "analysis"]],
    numerology: { 1: ["initiative", "independence"], 2: ["connection", "sensitivity"], 3: ["expression", "adaptability"], 4: ["stability", "responsibility"], 5: ["adaptability", "independence"], 6: ["responsibility", "connection"], 7: ["analysis", "sensitivity"], 8: ["initiative", "stability"], 9: ["connection", "transformation"], 11: ["sensitivity", "expression"], 22: ["stability", "transformation"] },
    mayan: [["initiative", "transformation"], ["connection", "sensitivity"], ["expression", "adaptability"], ["stability", "responsibility"], ["analysis", "independence"]],
    biorhythm: [["initiative", "stability"], ["sensitivity", "connection"], ["analysis", "adaptability"]],
    nakshatra: [["initiative", "independence"], ["stability", "responsibility"], ["adaptability", "connection"], ["sensitivity", "analysis"], ["expression", "transformation"]],
    celtic: [["stability", "responsibility"], ["adaptability", "transformation"], ["sensitivity", "connection"], ["analysis", "independence"]]
  });

  function normaliseSciences(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    value.forEach(function (raw) { const id = ALIASES[raw] || raw; if (ORDER.indexOf(id) >= 0) seen.add(id); });
    return ORDER.filter(function (id) { return seen.has(id); });
  }
  function ordinal(iso) { return Math.floor(Date.parse(iso + "T00:00:00Z") / 86400000); }
  function western(iso) {
    const month = Number(iso.slice(5, 7)), day = Number(iso.slice(8));
    const hr = root.HR;
    if (hr && typeof hr.getWesternIdx === "function" && Array.isArray(hr.WESTERN)) {
      const existing = hr.WESTERN[hr.getWesternIdx(day, month)];
      if (existing && typeof existing.n === "string" && typeof existing.el === "string") return { sign: existing.n, element: existing.el };
    }
    const cutoffs = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ["ราศีมังกร", "ราศีกุมภ์", "ราศีมีน", "ราศีเมษ", "ราศีพฤษภ", "ราศีเมถุน", "ราศีกรกฎ", "ราศีสิงห์", "ราศีกันย์", "ราศีตุล", "ราศีพิจิก", "ราศีธนู", "ราศีมังกร"];
    const elements = ["ดิน", "ลม", "น้ำ", "ไฟ", "ดิน", "ลม", "น้ำ", "ไฟ", "ดิน", "ลม", "น้ำ", "ไฟ", "ดิน"];
    const i = day >= cutoffs[month - 1] ? month : month - 1; return { sign: signs[i], element: elements[i] };
  }
  function evidenceFor(id, profileOrIso) {
    const profile = typeof profileOrIso === "string" ? { dob: profileOrIso } : profileOrIso;
    const iso = profile.dob;
    const date = new Date(iso + "T00:00:00Z"), year = date.getUTCFullYear(), day = date.getUTCDate(), month = date.getUTCMonth() + 1;
    const hr = root.HR;
    let themes, basis;
    if (id === "thai") { const i = date.getUTCDay(); themes = MAPS.thai[i]; basis = "วันเกิดตรงกับวัน" + ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"][i]; }
    else if (id === "western") { const z = western(iso); themes = MAPS.western[z.element]; basis = z.sign + " · ธาตุ" + z.element; }
    else if (id === "chinese") { const i = hr && typeof hr.getChineseIdx === "function" ? hr.getChineseIdx(year) : ((year - 4) % 12 + 12) % 12; themes = MAPS.chinese[i]; basis = "ลำดับนักษัตรจีน " + (i + 1) + "/12 จากปีเกิด"; }
    else if (id === "numerology") { const card = root.SorathaiProfile && root.SorathaiProfile.deriveBaseCard(profile); const n = card ? card.lifePath : root.SorathaiProfile.lifePath(iso); themes = MAPS.numerology[n]; basis = "เลขเส้นทางชีวิต " + n; }
    else if (id === "mayan") { const existing = hr && typeof hr.getMayan === "function" ? hr.getMayan(day, month, year) : null; const signIndex = existing && Array.isArray(hr.MAYAN_SIGNS) ? hr.MAYAN_SIGNS.indexOf(existing.sign) : ((ordinal(iso) + 160) % 20 + 20) % 20; const tone = existing ? existing.tone : (((ordinal(iso) + 160) % 13 + 13) % 13) + 1; themes = MAPS.mayan[((signIndex % 5) + 5) % 5]; basis = "สัญลักษณ์ Tzolk’in ลำดับ " + (signIndex + 1) + "/20 · โทน " + tone; }
    else if (id === "biorhythm") { const phase = ((ordinal(iso) % 23) + 23) % 23; const channel = phase % 3; themes = MAPS.biorhythm[channel]; basis = "วัฏจักรสัญลักษณ์ 23 วัน · เฟส " + phase; }
    else if (id === "nakshatra") { const existing = hr && typeof hr.getNakshatra === "function" ? hr.getNakshatra(day, month, year) : null; const i = existing && Array.isArray(hr.NAKSHATRA) ? hr.NAKSHATRA.indexOf(existing) : ((ordinal(iso) - ordinal("2000-01-01")) % 27 + 27) % 27; themes = MAPS.nakshatra[((i % 5) + 5) % 5]; basis = "ลำดับ Nakshatra " + (i + 1) + "/27"; }
    else { const existing = hr && typeof hr.getCeltic === "function" ? hr.getCeltic(day, month) : null; const i = existing && Array.isArray(hr.CELTIC) ? hr.CELTIC.indexOf(existing) : Math.floor((((month * 31) + day) % 364) / 91); themes = MAPS.celtic[((i % 4) + 4) % 4]; basis = "ช่วงต้นไม้ Celtic ตามวันและเดือนเกิด"; }
    return { scienceId: id, scienceName: SCIENCES[id].name, basis: basis, themes: themes.slice() };
  }
  function synthesize(profile) {
    if (!profile || typeof profile.dob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(profile.dob)) return null;
    const explored = normaliseSciences(profile.exploredSciences), evidence = explored.map(function (id) { return evidenceFor(id, profile); });
    const support = {}; Object.keys(THEMES).forEach(function (key) { support[key] = []; });
    evidence.forEach(function (item) { item.themes.forEach(function (theme) { support[theme].push(item.scienceId); }); });
    const repeated = Object.keys(THEMES).filter(function (key) { return support[key].length >= 2; }).map(function (key) { return { id: key, label: THEMES[key], sciences: support[key].slice() }; }).sort(function (a, b) { return b.sciences.length - a.sciences.length || Object.keys(THEMES).indexOf(a.id) - Object.keys(THEMES).indexOf(b.id); });
    const distinct = evidence.map(function (item) { return { scienceId: item.scienceId, scienceName: item.scienceName, themes: item.themes.filter(function (theme) { return support[theme].length === 1; }), basis: item.basis }; }).filter(function (item) { return item.themes.length; });
    const count = explored.length, statement = reflectionText(count, repeated, distinct);
    return { dob: profile.dob, explored: explored, missing: ORDER.filter(function (id) { return explored.indexOf(id) < 0; }), count: count, available: count >= 2, evidence: evidence, repeatedThemes: repeated, distinctPerspectives: distinct, statement: statement };
  }
  function names(ids) { return ids.map(function (id) { return SCIENCES[id].name; }).join(" และ "); }
  function reflectionText(count, repeated, distinct) {
    if (!count) return "ยังไม่มีศาสตร์ที่เปิด จึงยังสรุปภาพร่วมไม่ได้";
    const scope = "จาก " + count + " ศาสตร์ที่คุณเปิดแล้ว ";
    let text = repeated.length
      ? "เรื่องที่พูดตรงกันเด่นที่สุดคือ “" + repeated[0].label + "” เพราะปรากฏทั้งใน" + names(repeated[0].sciences)
      : "ยังไม่มีประเด็นใดปรากฏซ้ำจากอย่างน้อย 2 ศาสตร์ จึงควรอ่านแต่ละมุมแยกกันก่อน";
    if (distinct.length) text += " ขณะเดียวกัน" + distinct[0].scienceName + "เติมมุมเรื่อง" + distinct[0].themes.map(function (id) { return THEMES[id]; }).join("และ") + "ที่ศาสตร์อื่นยังไม่ได้เน้น";
    return scope + text + " ความสอดคล้องนี้เป็นการซ้อนภาษาสัญลักษณ์จากหลายระบบ ไม่ใช่หลักฐานว่าคำทำนายเป็นข้อเท็จจริงทางวิทยาศาสตร์";
  }
  function exportFilename(dob) { return /^\d{4}-\d{2}-\d{2}$/.test(dob || "") ? "sorathai-combined-" + dob + ".png" : "sorathai-combined.png"; }
  function profileUrl(path, profile, search, hash) {
    const split = path.split("#"), query = split[0].split("?"), params = new URLSearchParams(query[1] || search || "");
    if (profile && root.SorathaiProfile) params.set("dob", root.SorathaiProfile.toLegacy(profile.dob));
    const suffix = params.toString(); return query[0] + (suffix ? "?" + suffix : "") + (split[1] ? "#" + split[1] : (hash || ""));
  }
  function addEntryPoint(profile) {
    if (!root.document || !profile) return;
    const card = document.getElementById("share-card"); if (!card || document.querySelector(".combined-entry")) return;
    const count = normaliseSciences(profile.exploredSciences).length;
    const a = document.createElement("a"); a.className = "combined-entry"; a.href = profileUrl("profile.html", profile, location.search, location.hash);
    a.innerHTML = "<strong>โปรไฟล์รวมหลายศาสตร์</strong><span>ดูสิ่งที่หลายศาสตร์พูดตรงกัน " + count + "/8 →</span>";
    card.insertAdjacentElement("afterend", a);
  }
  return { ORDER, ALIASES, SCIENCES, THEMES, MAPS, normaliseSciences, western, evidenceFor, reflectionText, synthesize, exportFilename, profileUrl, addEntryPoint };
});
