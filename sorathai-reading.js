(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiReading = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const FOCUS_LABELS = Object.freeze({ identity: "ตัวตน", love: "ความรัก", career: "การงาน", challenge: "จุดท้าทาย" });
  const SCIENCES = Object.freeze({
    thai: { id: "thai", name: "โหราศาสตร์ไทย", layer: "THAI LAYER", origin: "คติโหราศาสตร์ไทย", icon: "☀️", accent: "#9a6d25" },
    western: { id: "western", name: "Western Astrology", layer: "WESTERN LAYER", origin: "คติกรีก–โรมัน", icon: "♈", accent: "#4a6582" },
    chinese: { id: "chinese", name: "Chinese Astrology", layer: "CHINESE LAYER", origin: "คติจีนโบราณ", icon: "龍", accent: "#9a4b42" },
    numerology: { id: "numerology", name: "Numerology", layer: "NUMEROLOGY LAYER", origin: "คติเลขศาสตร์", icon: "№", accent: "#386451" },
    mayan: { id: "mayan", name: "Mayan Tzolk’in", layer: "MAYAN LAYER", origin: "ปฏิทินเมโซอเมริกา", icon: "◉", accent: "#705883" },
    biorhythm: { id: "biorhythm", name: "Biorhythm", layer: "BIORHYTHM LAYER", origin: "แบบจำลองความเชื่อเรื่องวัฏจักร", icon: "◌", accent: "#426d82" },
    nakshatra: { id: "nakshatra", name: "Nakshatra", layer: "NAKSHATRA LAYER", origin: "คติโหราศาสตร์อินเดีย", icon: "✦", accent: "#9b603b" },
    celtic: { id: "celtic", name: "Celtic Tree", layer: "CELTIC LAYER", origin: "คติต้นไม้เคลต์", icon: "❧", accent: "#52705a" }
  });
  const WESTERN = [
    ["กุมภ์", "ลม", 120], ["มีน", "น้ำ", 219], ["เมษ", "ไฟ", 321], ["พฤษภ", "ดิน", 420],
    ["เมถุน", "ลม", 521], ["กรกฎ", "น้ำ", 621], ["สิงห์", "ไฟ", 723], ["กันย์", "ดิน", 823],
    ["ตุล", "ลม", 923], ["พิจิก", "น้ำ", 1023], ["ธนู", "ไฟ", 1122], ["มังกร", "ดิน", 1222]
  ];

  function safeConfig(id) {
    return SCIENCES[id] || { id: "reading", name: "Deep Reading", layer: "REFLECTION LAYER", origin: "มุมมองเชิงสัญลักษณ์", icon: "✦", accent: "#776b58" };
  }
  function westernFor(iso) {
    if (typeof iso !== "string") return null;
    const key = Number(iso.slice(5, 7) + iso.slice(8, 10));
    let result = ["มังกร", "ดิน"];
    WESTERN.forEach(function (item) { if (key >= item[2]) result = item; });
    return { sign: result[0], element: result[1] };
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
  function reorderForFocus(container, focus) {
    if (!container || !focus) return;
    const needles = { identity: ["นิสัย", "ตัวตน", "บุคลิก"], love: ["รัก", "สัมพันธ์"], career: ["งาน", "การเงิน"], challenge: ["ระวัง", "ท้าทาย", "เงา"] }[focus];
    const sections = Array.from(container.querySelectorAll(".rdg"));
    const match = sections.find(function (section) { return needles.some(function (word) { return section.textContent.indexOf(word) >= 0; }); });
    if (match) { match.classList.add("reading-focus-emphasis"); container.insertBefore(match, container.firstChild); }
  }
  function enhance(scienceId, profile) {
    if (!root.document || !profile) return;
    const context = deriveContext(profile, root.location ? root.location.search : "", scienceId), base = inheritedBase(profile, context.focus);
    const card = document.getElementById("share-card");
    if (!card || !base) return;
    card.classList.add("deep-reading-card"); card.style.setProperty("--reading-accent", context.science.accent);
    let layer = card.querySelector(".inherited-layer");
    if (!layer) { layer = document.createElement("section"); layer.className = "inherited-layer"; card.querySelector(".sc-top").insertAdjacentElement("afterend", layer); }
    const date = base.dob.split("-").reverse().join("/");
    layer.innerHTML = '<div class="layer-relation"><span>BASE PROFILE</span><b aria-hidden="true">＋</b><span>' + context.science.layer + '</span></div><div class="science-signature"><span aria-hidden="true">' + context.science.icon + '</span><div><strong>' + context.science.name + '</strong><small>' + context.science.origin + '</small></div></div><dl class="base-facts"><div><dt>วันเกิด</dt><dd>' + date + '</dd></div><div><dt>Base archetype</dt><dd>' + base.archetype + '</dd></div><div><dt>ราศี · ธาตุ</dt><dd>' + base.westernSign + ' · ' + base.element + '</dd></div><div><dt>Life path</dt><dd>' + base.lifePath + '</dd></div>' + (base.focusLabel ? '<div class="base-focus"><dt>มุมที่เลือก</dt><dd>' + base.focusLabel + '</dd></div>' : '') + '</dl>';
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
  return { FOCUS_LABELS, SCIENCES, safeConfig, westernFor, deriveContext, inheritedBase, scienceUrl, exportFilename, enhance, exportCard };
});
