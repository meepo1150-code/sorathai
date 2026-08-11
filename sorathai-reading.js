(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiReading = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const DEFAULT_FOCUS_LABELS = Object.freeze({ identity: "ตัวตน", love: "ความรัก", career: "การงาน", challenge: "จุดที่ควรระวัง" });
  const FOCUS_LABELS = root.SorathaiContent && root.SorathaiContent.FOCUS
    ? Object.freeze(Object.fromEntries(Object.entries(root.SorathaiContent.FOCUS).map(([id, item]) => [id, item.label])))
    : DEFAULT_FOCUS_LABELS;
  const SCIENCES = Object.freeze({
    thai: { id: "thai", name: "โหราศาสตร์ไทย", layer: "มุมมองโหราศาสตร์ไทย", origin: "คติโหราศาสตร์ไทย", icon: "☀️", accent: "#9a6d25" },
    western: { id: "western", name: "โหราศาสตร์ตะวันตก", layer: "มุมมองราศีตะวันตก", origin: "คติโหราศาสตร์ตะวันตก", icon: "♈", accent: "#4a6582" },
    chinese: { id: "chinese", name: "โหราศาสตร์จีน", layer: "มุมมองนักษัตรจีน", origin: "คติโหราศาสตร์จีน", icon: "龍", accent: "#9a4b42" },
    numerology: { id: "numerology", name: "เลขศาสตร์", layer: "มุมมองเลขเส้นทางชีวิต", origin: "คติเลขศาสตร์", icon: "№", accent: "#386451" },
    mayan: { id: "mayan", name: "ปฏิทินมายา", layer: "มุมมองปฏิทินมายา", origin: "วัฏจักร Tzolk’in", icon: "◉", accent: "#705883" },
    biorhythm: { id: "biorhythm", name: "ไบโอริทึม", layer: "มุมมองวัฏจักรไบโอริทึม", origin: "แบบจำลองวัฏจักรตามวันเกิด", icon: "◌", accent: "#426d82" },
    nakshatra: { id: "nakshatra", name: "ดาวฤกษ์อินเดีย", layer: "มุมมองดาวฤกษ์อินเดีย", origin: "คติโหราศาสตร์อินเดีย", icon: "✦", accent: "#9b603b" },
    celtic: { id: "celtic", name: "ต้นไม้เคลต์", layer: "มุมมองต้นไม้เคลต์", origin: "คติต้นไม้เชิงสัญลักษณ์", icon: "❧", accent: "#52705a" }
  });
  function safeConfig(id) {
    return SCIENCES[id] || { id: "reading", name: "คำอ่านเชิงลึก", layer: "มุมมองเพิ่มเติม", origin: "มุมมองเชิงสัญลักษณ์", icon: "✦", accent: "#776b58" };
  }
  function westernFor(iso) {
    if (typeof iso !== "string") return null;
    const month = Number(iso.slice(5, 7)), day = Number(iso.slice(8, 10));
    const hr = root.HR;
    if (hr && typeof hr.getWesternIdx === "function" && Array.isArray(hr.WESTERN)) {
      const existing = hr.WESTERN[hr.getWesternIdx(day, month)];
      if (existing && typeof existing.n === "string" && typeof existing.el === "string") return { sign: existing.n, element: existing.el };
    }
    const cutoffs = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
    const signs = ["ราศีมังกร", "ราศีกุมภ์", "ราศีมีน", "ราศีเมษ", "ราศีพฤษภ", "ราศีเมถุน", "ราศีกรกฎ", "ราศีสิงห์", "ราศีกันย์", "ราศีตุล", "ราศีพิจิก", "ราศีธนู", "ราศีมังกร"];
    const elements = ["ดิน", "ลม", "น้ำ", "ไฟ", "ดิน", "ลม", "น้ำ", "ไฟ", "ดิน", "ลม", "น้ำ", "ไฟ", "ดิน"];
    const index = day >= cutoffs[month - 1] ? month : month - 1;
    return { sign: signs[index], element: elements[index] };
  }
  function deriveContext(profile, search, scienceId) {
    const params = new URLSearchParams(search || ""), rawFocus = params.get("focus");
    return { profile: profile || null, science: safeConfig(scienceId), focus: Object.prototype.hasOwnProperty.call(FOCUS_LABELS, rawFocus) ? rawFocus : null, focusLabel: FOCUS_LABELS[rawFocus] || null };
  }
  function inheritedBase(profile, focus) {
    if (!profile || !root.SorathaiProfile) return null;
    const card = root.SorathaiProfile.deriveBaseCard(profile), western = westernFor(profile.dob);
    if (!card || !western) return null;
    return { dob: card.dob, archetype: card.archetype, westernSign: western.sign, element: western.element, lifePath: card.lifePath, focusLabel: FOCUS_LABELS[focus] || null };
  }
  function scienceUrl(path, profile, focus) {
    return root.SorathaiProfile && root.SorathaiProfile.readingUrl ? root.SorathaiProfile.readingUrl(path, profile, focus) : path;
  }
  function exportFilename(scienceId, dob) {
    const id = safeConfig(scienceId).id;
    const date = typeof dob === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dob) ? "-" + dob : "";
    return "sorathai-" + id + date + ".png";
  }
  function hashText(value) {
    let hash = 2166136261;
    String(value || "").split("").forEach(function (char) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); });
    return hash >>> 0;
  }
  function semanticVisualKey(scienceId, title) {
    const text = String(title || "").trim();
    if (scienceId === "thai") {
      const days = [["จันทร์","monday"],["อังคาร","tuesday"],["พุธ","wednesday"],["พฤหัส","thursday"],["ศุกร์","friday"],["เสาร์","saturday"],["อาทิตย์","sunday"]];
      const found = days.find(function (item) { return text.indexOf(item[0]) >= 0; });
      if (found) return "thai-" + found[1];
    }
    if (scienceId === "western") {
      const signs = [["มังกร","capricorn"],["กุมภ์","aquarius"],["มีน","pisces"],["เมษ","aries"],["พฤษภ","taurus"],["เมถุน","gemini"],["กรกฎ","cancer"],["สิงห์","leo"],["กันย์","virgo"],["ตุล","libra"],["พิจิก","scorpio"],["ธนู","sagittarius"]];
      const found = signs.find(function (item) { return text.indexOf(item[0]) >= 0; });
      if (found) return "western-" + found[1];
    }
    return scienceId + "-result";
  }
  function repairChineseResult(profile) {
    if (!root.document || !profile || !root.HR || !Array.isArray(root.HR.CHINESE) || typeof root.HR.getChineseIdx !== "function") return;
    const year = Number(profile.dob.slice(0, 4)), ch = root.HR.CHINESE[root.HR.getChineseIdx(year)];
    if (!ch) return;
    const name = ch.name || ch.n || "", element = ch.element || ch.el || "", polarity = ch.pol || "", icon = ch.ico || ch.i || "辰";
    const set = function (id, value) { const node = document.getElementById(id); if (node && value !== undefined && value !== null) node.textContent = String(value); };
    set("rh-ttl", name ? "ปีนักษัตร" + name : "ราศีจีน");
    set("rh-sub", [name, element ? "ธาตุ" + element : "", polarity].filter(Boolean).join(" · "));
    set("rh-ico", icon); set("e-ico", icon);
    set("fc1", element || "—"); set("fc2", polarity || "—"); set("fc3", String(year + 543));
    set("sc-orb", icon); set("sc-ttl", name ? "ปี" + name : "ราศีจีน");
    set("ss1", name || "—"); set("ss2", element || "—"); set("ss3", polarity || "—"); set("ss4", "นักษัตร");
    document.querySelectorAll("#s-result *").forEach(function (node) {
      if (node.children.length || typeof node.textContent !== "string" || node.textContent.indexOf("undefined") < 0) return;
      node.textContent = node.textContent.replace(/undefined/gi, "—");
    });
  }
  function applyVisualIdentity(scienceId) {
    if (!root.document || !document.body) return null;
    const hero = document.getElementById("rh-ttl"), sub = document.getElementById("rh-sub"), facts = document.querySelector(".facts");
    const title = hero ? hero.textContent : "", subtitle = sub ? sub.textContent : "", factText = facts ? facts.textContent : "";
    const seedText = [scienceId, title, subtitle, factText].join("|");
    const seed = hashText(seedText), variant = seed % 12 + 1;
    document.body.dataset.readingScience = safeConfig(scienceId).id;
    document.body.dataset.readingVariant = String(variant);
    document.body.dataset.readingKey = semanticVisualKey(scienceId, title);
    document.body.style.setProperty("--identity-shift-x", String(seed % 29 - 14) + "px");
    document.body.style.setProperty("--identity-shift-y", String((seed >>> 5) % 23 - 11) + "px");
    document.body.style.setProperty("--identity-rotation", String(((seed >>> 9) % 25 - 12) / 10) + "deg");
    return { key: document.body.dataset.readingKey, variant: variant };
  }
  function reorderForFocus(container, focus) {
    if (!container || !focus) return;
    const needles = { identity: ["นิสัย", "ตัวตน", "บุคลิก", "ภาพรวม"], love: ["รัก", "สัมพันธ์"], career: ["งาน", "การเงิน", "เส้นทาง"], challenge: ["ระวัง", "ท้าทาย", "เงา", "บทเรียน"] }[focus];
    const sections = Array.from(container.querySelectorAll(".rdg"));
    const match = sections.find(function (section) { return needles.some(function (word) { return section.textContent.indexOf(word) >= 0; }); });
    if (match) { match.classList.add("reading-focus-emphasis"); container.insertBefore(match, container.firstChild); }
  }
  function enhance(scienceId, profile) {
    if (!root.document || !profile) return;
    const context = deriveContext(profile, root.location ? root.location.search : "", scienceId), base = inheritedBase(profile, context.focus);
    if (scienceId === "chinese") repairChineseResult(profile);
    applyVisualIdentity(scienceId);
    const card = document.getElementById("share-card");
    if (!card || !base) return;
    card.classList.add("deep-reading-card"); card.style.setProperty("--reading-accent", context.science.accent);
    let layer = card.querySelector(".inherited-layer");
    if (!layer) { layer = document.createElement("section"); layer.className = "inherited-layer"; card.querySelector(".sc-top").insertAdjacentElement("afterend", layer); }
    const date = base.dob.split("-").reverse().join("/");
    const intro = root.SorathaiContent && typeof root.SorathaiContent.scienceIntro === "function" ? root.SorathaiContent.scienceIntro(scienceId) : context.science.origin;
    layer.innerHTML = '<div class="layer-relation"><span>โปรไฟล์พื้นฐาน</span><b aria-hidden="true">＋</b><span>' + context.science.layer + '</span></div><div class="science-signature"><span aria-hidden="true">' + context.science.icon + '</span><div><strong>' + context.science.name + '</strong><small>' + intro + '</small></div></div><dl class="base-facts"><div><dt>วันเกิด</dt><dd>' + date + '</dd></div><div><dt>ภาพรวมพื้นฐาน</dt><dd>' + base.archetype + '</dd></div><div><dt>ราศี · ธาตุ</dt><dd>' + base.westernSign + ' · ' + base.element + '</dd></div><div><dt>เลขเส้นทางชีวิต</dt><dd>' + base.lifePath + '</dd></div>' + (base.focusLabel ? '<div class="base-focus"><dt>เรื่องที่อยากรู้</dt><dd>' + base.focusLabel + '</dd></div>' : '') + '</dl>';
    reorderForFocus(document.getElementById("rdgs"), context.focus);
    document.querySelectorAll("a[href]").forEach(function (link) {
      const value = link.getAttribute("href");
      if (/(?:index|thai-astrology|western-astrology|chinese-astrology|numerology|mayan|biorhythm|nakshatra|celtic)\.html/.test(value)) link.href = scienceUrl(value, profile, context.focus);
    });
  }
  async function exportCard(scienceId, profile, cardId, statusId) {
    const card = root.document && document.getElementById(cardId || "share-card"), status = root.document && document.getElementById(statusId || "export-status");
    const overlay = status && status.closest(".sov");
    function announce(message) { if (status) status.textContent = message; }
    if (!card || typeof root.html2canvas !== "function") { announce("ไม่สามารถสร้างภาพได้ในขณะนี้"); return false; }
    announce("กำลังสร้างภาพการ์ด"); if (overlay) overlay.classList.add("show");
    try {
      const canvas = await root.html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, scrollX: 0, scrollY: -root.scrollY, windowWidth: Math.max(document.documentElement.scrollWidth, card.scrollWidth) });
      const link = document.createElement("a"); link.download = exportFilename(scienceId, profile && profile.dob); link.href = canvas.toDataURL("image/png"); link.click(); announce("บันทึกภาพการ์ดแล้ว"); return true;
    } catch (_) { announce("สร้างภาพไม่สำเร็จ กรุณาลองอีกครั้ง"); return false; }
    finally { if (overlay) overlay.classList.remove("show"); }
  }
  return { FOCUS_LABELS, SCIENCES, safeConfig, westernFor, deriveContext, inheritedBase, scienceUrl, exportFilename, applyVisualIdentity, repairChineseResult, enhance, exportCard };
});