(function () {
  "use strict";

  function drawerTriggerFrom(target) {
    if (!target || typeof target.closest !== "function") return null;
    return target.closest('[onclick*="openDrw"]');
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { drawerTriggerFrom: drawerTriggerFrom };
  }
  if (typeof document === "undefined") return;

  const HOME_SCIENCE_DESCRIPTIONS = Object.freeze({
    thai: "อ่านวันเกิดประจำสัปดาห์และดาวประจำวัน เพื่อดูบุคลิก วิธีตัดสินใจ ความรัก การงาน และจุดที่ควรระวัง",
    western: "ดูราศี ธาตุ และดาวครอง แล้วแปลเป็นบุคลิก วิธีตัดสินใจ ความรัก และการงาน",
    chinese: "อ่านนักษัตรและธาตุจากปีเกิด เพื่อดูรูปแบบการเข้าสังคม การตัดสินใจ ความสัมพันธ์ และจุดแข็ง",
    numerology: "อ่านเลขเส้นทางชีวิตจากวันเกิด เพื่อดูแรงจูงใจ จุดแข็ง และบทเรียนที่มักเกิดซ้ำ",
    mayan: "ดูสัญลักษณ์และโทนในวัฏจักร Tzolk’in เพื่อสะท้อนแรงขับ รูปแบบการเติบโต และมุมที่ควรพัฒนา",
    biorhythm: "ดูตำแหน่งวัฏจักรกาย อารมณ์ และความคิดของวันที่กำลังดู โดยไม่ใช้เป็นการวินิจฉัยสุขภาพ",
    nakshatra: "อ่านดาวฤกษ์อินเดียที่สัมพันธ์กับวันเกิด เพื่อดูแรงจูงใจ อารมณ์ ความสัมพันธ์ จุดแข็ง และความท้าทาย",
    celtic: "อ่านต้นไม้เชิงสัญลักษณ์ตามช่วงวันเกิด เพื่อสะท้อนบุคลิก ความสัมพันธ์ การเติบโต และสิ่งที่ควรพัฒนา"
  });

  const SCIENCE_PATHS = Object.freeze({
    "thai-astrology.html": "thai",
    "western-astrology.html": "western",
    "chinese-astrology.html": "chinese",
    "numerology.html": "numerology",
    "mayan.html": "mayan",
    "biorhythm.html": "biorhythm",
    "nakshatra.html": "nakshatra",
    "celtic.html": "celtic"
  });

  const SCIENCE_ACCENTS = Object.freeze({
    thai: "#c8952c", western: "#4a6fa5", chinese: "#c0392b", numerology: "#2d6a4f",
    mayan: "#7b4f9e", biorhythm: "#2980b9", nakshatra: "#d35400", celtic: "#4a7c59"
  });

  function markDecorativeIcons() {
    document.querySelectorAll(".nico,.dico,.science-icon,.rc-ico,.err-ico,.spin").forEach(function (icon) {
      icon.setAttribute("aria-hidden", "true");
    });
  }

  function enhanceDrawer(drawer) {
    if (!drawer || drawer.dataset.accessibleDrawer) return;
    drawer.dataset.accessibleDrawer = "true";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "ศาสตร์ดูดวงทั้งหมด");
    drawer.setAttribute("aria-hidden", drawer.classList.contains("open") ? "false" : "true");
    let returnTarget = null;
    document.addEventListener("click", function (event) {
      const trigger = drawerTriggerFrom(event.target);
      if (!trigger) return;
      returnTarget = trigger;
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", drawer.id);
    }, true);
    const observer = new MutationObserver(function () {
      const open = drawer.classList.contains("open");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        if (!returnTarget) returnTarget = document.querySelector('[onclick*="openDrw"]');
        const first = drawer.querySelector("a,button");
        if (first) first.focus();
      } else if (returnTarget) {
        if (returnTarget.isConnected) returnTarget.focus();
        returnTarget = null;
      }
    });
    observer.observe(drawer, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("keydown", function (event) {
      if (!drawer.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (typeof window.closeDrw === "function") window.closeDrw();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(drawer.querySelectorAll("a[href],button:not([disabled])"));
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function setText(node, value) {
    if (node && typeof value === "string" && node.textContent !== value) node.textContent = value;
  }

  function loadScriptOnce(src, marker, globalName, callback) {
    if (window[globalName]) { callback(window[globalName]); return; }
    let script = document.querySelector('script[' + marker + ']');
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute(marker, "true");
      document.head.appendChild(script);
    }
    script.addEventListener("load", function () { if (window[globalName]) callback(window[globalName]); }, { once: true });
  }

  function ensureSharedContent(callback) { loadScriptOnce("sorathai-content.js", "data-sorathai-content-loader", "SorathaiContent", callback); }
  function ensureDeepExtension(callback) { loadScriptOnce("sorathai-deep-content.js", "data-sorathai-deep-loader", "SorathaiDeepContent", callback); }

  function ensureHomeStyles() {
    if (document.getElementById("sorathai-home-content-style")) return;
    const style = document.createElement("style");
    style.id = "sorathai-home-content-style";
    style.textContent = `
.home-header{min-height:68px;height:auto;padding-block:14px}
.home-logo{font-size:24px}
.home-kicker{font-size:10px;letter-spacing:.18em}
.landing{padding:clamp(36px,7vw,76px) 0 clamp(64px,10vw,110px)}
.landing-grid{gap:clamp(36px,7vw,72px)}
.intro-mark{margin-bottom:28px}
.intro h1{text-wrap:balance}
.intro p{font-size:clamp(15px,2.5vw,17px);line-height:1.85}
.birth-panel{border-color:rgba(35,31,25,.1);box-shadow:0 20px 60px rgba(35,29,19,.08)}
.birth-panel h2{font-size:26px}
.birth-lead{line-height:1.75}
.field select{border-radius:12px;transition:border-color .15s,box-shadow .15s}
.primary{border-radius:12px;min-height:56px}
.privacy{max-width:38ch;margin-inline:auto;line-height:1.65}
.result{padding:clamp(62px,10vw,104px) 0}
.result-heading{max-width:620px;margin:0 auto 36px}
.result-heading h2{font-size:clamp(34px,7vw,48px);line-height:1.12;text-wrap:balance}
.result-heading p{max-width:52ch;margin-inline:auto;font-size:15px;line-height:1.8}
.destiny-card{border-color:#d2c8b6;box-shadow:0 28px 72px rgba(35,29,19,.11)}
.card-top{min-height:66px}
.card-main{padding-block:clamp(34px,6vw,48px)}
.sign-row{align-items:flex-start}
.sign-glyph{flex:0 0 auto}
.identity h3{line-height:1.12;text-wrap:balance}
.summary{font-family:var(--sans);font-style:normal;font-size:16px;line-height:1.85;color:#3e3933;margin:30px 0 28px}
.card-facts{margin-bottom:4px}
.fact{padding-block:17px}
.base-consultation{margin:6px 0 0;border-top:0;border-bottom:1px solid #d8d0c1}
.base-consultation-row{padding:18px 2px;border-bottom:1px solid #d8d0c1}
.base-consultation-row:last-child{border-bottom:0}
.base-consultation-row b{display:block;font-size:12px;letter-spacing:.01em;margin-bottom:7px}
.base-consultation-row p{font-size:14px;line-height:1.8;color:#4e4942;max-width:58ch}
.base-consultation-row.caution{background:linear-gradient(90deg,rgba(138,53,46,.045),transparent);padding-inline:10px;margin-inline:-10px}
.base-consultation-row.caution b{color:#8a352e}
.powers-title{margin-top:30px;font-weight:600}
.powers{gap:16px 24px;padding:16px;border:1px solid rgba(35,31,25,.08);border-radius:14px;background:rgba(255,255,255,.35)}
.power-head{font-size:12px}.power-track{height:4px}
.power-note{max-width:58ch;line-height:1.7}
.card-actions{max-width:680px;margin-top:22px;gap:8px}
.text-button{min-height:46px;padding:9px 17px}
#combined-profile{font-weight:700;border-color:#a9997f;background:#f1ecdf}
#combined-profile.ready{background:#24221e;color:#fff;border-color:#24221e}
#export-card{border-color:#aa9b81}
#reset-date{border-color:transparent;text-decoration:underline;text-underline-offset:4px}
.explore{margin-top:clamp(74px,11vw,112px);padding-top:clamp(32px,5vw,52px);border-top:1px solid var(--bdr)}
.explore>p{max-width:58ch;font-size:15px;line-height:1.8}
.science-grid{gap:14px;margin-top:32px}
.science-card{min-height:112px;border-radius:16px;padding:21px;gap:16px;box-shadow:0 7px 22px rgba(35,31,25,.035)}
.science-card:hover{box-shadow:0 10px 28px rgba(35,31,25,.07)}
.science-card h3{font-size:16px}.science-card p{font-size:13px;line-height:1.65}
.science-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#f6f3ec}
.arrow{font-size:17px}
.dream{margin-top:34px;padding:26px 24px;border:1px solid var(--bdr);border-radius:16px;background:rgba(255,255,255,.45)}
.dream strong{font:500 18px/1.4 var(--serif)}
.dream p{font-size:13px;line-height:1.75;max-width:60ch}
.disclaimer{margin-top:58px;line-height:1.75}
@media(min-width:760px){
  .landing-grid{grid-template-columns:minmax(0,1.15fr) minmax(330px,.85fr)}
  .birth-panel{padding:34px}
  .science-card{min-height:126px}
}
@media(max-width:520px){
  .home-shell{padding-inline:18px}
  .home-kicker{font-size:9px}
  .landing{min-height:auto;padding-top:30px}
  .intro h1{font-size:clamp(40px,13vw,58px)}
  .date-fields{gap:7px}
  .field select{height:54px;padding-inline:7px}
  .card-top{padding:17px 19px}
  .card-main{padding:30px 19px 26px}
  .sign-row{gap:14px}
  .sign-glyph{width:66px;height:66px;font-size:44px}
  .summary{margin-top:24px}
  .card-actions{display:grid;grid-template-columns:1fr 1fr;width:100%}
  .card-actions .text-button{width:100%;justify-content:center;text-align:center}
  #combined-profile{grid-column:1/-1;order:-1}
  #reset-date{border:1px solid transparent}
  .science-card{padding:18px 16px;min-height:104px}
  .dream{padding:22px 18px}
}
@media(max-width:350px){
  .card-actions{grid-template-columns:1fr}
  #combined-profile{grid-column:auto}
  .powers{grid-template-columns:1fr;padding:14px}
}`;
    document.head.appendChild(style);
  }

  function updateConsultationSection(content) {
    const facts = document.querySelector("#destiny-card .card-facts"), elementNode = document.getElementById("fact-element");
    if (!facts || !elementNode || !content || typeof content.base !== "function") return;
    const element = elementNode.textContent.replace(/^ธาตุ/, "").trim(), reading = content.base(element);
    if (!reading) return;
    setText(document.getElementById("card-summary"), reading.summary);
    let section = document.querySelector("#destiny-card .base-consultation");
    if (!section) {
      section = document.createElement("section");
      section.className = "base-consultation";
      section.setAttribute("aria-label", "คำอ่านพื้นฐานจากวันเกิด");
      section.innerHTML = '<div class="base-consultation-row"><b>วิธีคิดและตัดสินใจ</b><p data-base="decision"></p></div><div class="base-consultation-row"><b>สิ่งที่คนอื่นมักเห็นในตัวคุณ</b><p data-base="visible"></p></div><div class="base-consultation-row"><b>จุดแข็ง</b><p data-base="strength"></p></div><div class="base-consultation-row caution"><b>จุดที่ควรระวัง</b><p data-base="caution"></p></div>';
      facts.insertAdjacentElement("afterend", section);
    }
    ["decision", "visible", "strength", "caution"].forEach(function (key) { setText(section.querySelector('[data-base="' + key + '"]'), reading[key]); });
  }

  function updateHomeScienceCards(content) {
    document.querySelectorAll("#science-grid a[data-science-id]").forEach(function (card) {
      const id = card.dataset.scienceId, title = card.querySelector("h3"), description = card.querySelector("p");
      if (content && typeof content.scienceName === "function") setText(title, content.scienceName(id));
      if (HOME_SCIENCE_DESCRIPTIONS[id]) setText(description, HOME_SCIENCE_DESCRIPTIONS[id]);
      if (title) card.dataset.scienceName = title.textContent;
    });
  }

  function enhanceHomeContent(content) {
    const result = document.getElementById("profile-result");
    if (!result) return;
    ensureHomeStyles();
    const heading = result.querySelector(".result-heading");
    if (heading) {
      setText(heading.querySelector(".eyebrow"), "คำอ่านแรกจากวันเกิด");
      setText(heading.querySelector("h2"), "คำอ่านพื้นฐานของคุณ");
      setText(heading.querySelector("p"), "เริ่มจากภาพรวมสั้น ๆ ว่าคุณมักคิด ตัดสินใจ และใช้จุดแข็งแบบไหน ก่อนเลือกศาสตร์ที่อยากดูต่อ");
    }
    const explore = result.querySelector(".explore");
    if (explore) {
      setText(explore.querySelector(".eyebrow"), "เลือกเรื่องที่อยากดูต่อ");
      setText(explore.querySelector("h2"), "อยากให้ศาสตร์ไหนเล่าเรื่องของคุณต่อ?");
      setText(explore.querySelector(":scope > p"), "แต่ละศาสตร์ใช้วันเกิดเดียวกัน แต่จะอธิบายคนละมุม เลือกจากเรื่องที่คุณอยากเข้าใจมากที่สุด");
    }
    const combined = document.getElementById("combined-profile");
    if (combined && !combined.hidden) {
      const match = combined.textContent.match(/(\d+)\/8/);
      const count = match ? Number(match[1]) : 0;
      setText(combined, "โปรไฟล์รวม" + (match ? " · " + match[0] : ""));
      combined.classList.toggle("ready", count >= 2);
    }
    updateConsultationSection(content);
    updateHomeScienceCards(content);
    setText(result.querySelector(".powers-title"), "ตัวชี้วัดเชิงสัญลักษณ์จากโปรไฟล์");
    setText(result.querySelector(".power-note"), "ค่าด้านล่างเป็นตัวชี้วัดเชิงสัญลักษณ์ที่สร้างอย่างคงที่จากวันเกิด ใช้เพื่อเปรียบเทียบมุมต่าง ๆ ของโปรไฟล์ ไม่ใช่คะแนนความสามารถหรือผลการวัดทางวิทยาศาสตร์");
  }

  function loadHomeContent() {
    if (!document.getElementById("profile-result")) return;
    ensureSharedContent(function (content) {
      enhanceHomeContent(content);
      const result = document.getElementById("profile-result"), grid = document.getElementById("science-grid");
      if (result) new MutationObserver(function () { enhanceHomeContent(content); }).observe(result, { attributes: true, attributeFilter: ["class"] });
      if (grid) new MutationObserver(function () { enhanceHomeContent(content); }).observe(grid, { childList: true });
    });
  }

  function currentScienceId() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return SCIENCE_PATHS[file] || null;
  }

  function ensureDeepStyles() {
    if (document.getElementById("sorathai-deep-content-style")) return;
    const style = document.createElement("style");
    style.id = "sorathai-deep-content-style";
    style.textContent = ".reading-basis{margin:20px 24px 0;padding:18px 20px;border:1px solid var(--bdr);border-radius:14px;background:var(--surf)}.reading-basis b{display:block;font-size:12px;margin-bottom:7px}.reading-basis p{font-size:13px;line-height:1.75;color:var(--t2)}";
    document.head.appendChild(style);
  }

  function biorhythmValues(y, m, d) {
    const now = new Date(), today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()), born = Date.UTC(y, m - 1, d);
    const days = Math.floor((today - born) / 86400000);
    return {
      physical: Math.round(Math.sin(2 * Math.PI * days / 23) * 100),
      emotional: Math.round(Math.sin(2 * Math.PI * days / 28) * 100),
      intellectual: Math.round(Math.sin(2 * Math.PI * days / 33) * 100)
    };
  }

  function deepSectionsFor(scienceId, content, profile, deepContent) {
    if (!profile || !window.HR) return [];
    const parts = profile.dob.split("-").map(Number), y = parts[0], m = parts[1], d = parts[2];
    if (scienceId === "thai" && typeof content.thaiReading === "function") return content.thaiReading(window.HR.THAI_DAY[new Date(y, m - 1, d).getDay()]);
    if (scienceId === "western" && typeof content.westernReading === "function") return content.westernReading(window.HR.WESTERN[window.HR.getWesternIdx(d, m)]);
    if (scienceId === "chinese" && typeof content.chineseReading === "function") return content.chineseReading(window.HR.CHINESE[window.HR.getChineseIdx(y)]);
    if (scienceId === "numerology" && typeof content.numerologyReading === "function") {
      const card = window.SorathaiProfile.deriveBaseCard(profile), lifePath = card && card.lifePath;
      return content.numerologyReading(lifePath, window.HR.NUMEROLOGY[lifePath] || window.HR.NUMEROLOGY[1]);
    }
    if (!deepContent) return [];
    if (scienceId === "mayan" && typeof deepContent.mayanReading === "function") return deepContent.mayanReading(window.HR.getMayan(d, m, y));
    if (scienceId === "nakshatra" && typeof deepContent.nakshatraReading === "function") return deepContent.nakshatraReading(window.HR.getNakshatra(d, m, y));
    if (scienceId === "celtic" && typeof deepContent.celticReading === "function") return deepContent.celticReading(window.HR.getCeltic(d, m));
    if (scienceId === "biorhythm" && typeof deepContent.biorhythmReading === "function") return deepContent.biorhythmReading(biorhythmValues(y, m, d));
    return [];
  }

  function rewriteDeepReading(scienceId, content, deepContent) {
    const result = document.getElementById("s-result"), rdgs = document.getElementById("rdgs");
    if (!result || !rdgs || !result.classList.contains("show") || !window.SorathaiProfile) return;
    const profile = window.SorathaiProfile.fromLocation(location.search);
    if (!profile) return;
    const sections = deepSectionsFor(scienceId, content, profile, deepContent);
    if (!sections.length) return;
    const dayStamp = scienceId === "biorhythm" ? ":" + new Date().toISOString().slice(0, 10) : "", stamp = scienceId + ":" + profile.dob + dayStamp;
    if (rdgs.dataset.sorathaiContentStamp === stamp && rdgs.querySelector(".rdg")) return;
    ensureDeepStyles();
    let basis = result.querySelector(".reading-basis");
    if (!basis) {
      basis = document.createElement("section");
      basis.className = "reading-basis";
      basis.innerHTML = "<b>ศาสตร์นี้กำลังดูอะไร</b><p></p>";
      rdgs.insertAdjacentElement("beforebegin", basis);
    }
    setText(basis.querySelector("b"), content.scienceName(scienceId) + " กำลังดูอะไร");
    setText(basis.querySelector("p"), content.scienceIntro(scienceId));
    const accent = SCIENCE_ACCENTS[scienceId] || "#776b58", fragment = document.createDocumentFragment();
    sections.forEach(function (section) {
      const item = document.createElement("div"); item.className = "rdg";
      const title = document.createElement("div"); title.className = "rdg-tp"; title.style.color = accent; title.textContent = section.title;
      const body = document.createElement("div"); body.className = "rdg-b"; body.textContent = section.body;
      item.append(title, body); fragment.appendChild(item);
    });
    rdgs.replaceChildren(fragment);
    rdgs.dataset.sorathaiContentStamp = stamp;
    setText(result.querySelector(".rh-ey"), content.scienceName(scienceId));
    if (window.SorathaiReading && typeof window.SorathaiReading.enhance === "function") window.SorathaiReading.enhance(scienceId, profile);
  }

  function observeDeepReading(scienceId, content, deepContent) {
    rewriteDeepReading(scienceId, content, deepContent);
    const result = document.getElementById("s-result"), rdgs = document.getElementById("rdgs");
    if (result) new MutationObserver(function () { rewriteDeepReading(scienceId, content, deepContent); }).observe(result, { attributes: true, attributeFilter: ["class"] });
    if (rdgs) new MutationObserver(function () { rewriteDeepReading(scienceId, content, deepContent); }).observe(rdgs, { childList: true });
  }

  function loadDeepContent() {
    const scienceId = currentScienceId();
    if (!scienceId) return;
    ensureSharedContent(function (content) {
      if (["mayan", "biorhythm", "nakshatra", "celtic"].includes(scienceId)) ensureDeepExtension(function (deepContent) { observeDeepReading(scienceId, content, deepContent); });
      else observeDeepReading(scienceId, content, null);
    });
  }

  function init() {
    markDecorativeIcons();
    enhanceDrawer(document.getElementById("drw"));
    loadHomeContent();
    loadDeepContent();
    new MutationObserver(markDecorativeIcons).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();