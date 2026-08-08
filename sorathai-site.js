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

  function ensureHomeStyles() {
    if (document.getElementById("sorathai-home-content-style")) return;
    const style = document.createElement("style");
    style.id = "sorathai-home-content-style";
    style.textContent = ".base-consultation{margin:22px 0 4px;border-block:1px solid #d8d0c1}.base-consultation-row{padding:14px 2px;border-bottom:1px solid #d8d0c1}.base-consultation-row:last-child{border-bottom:0}.base-consultation-row b{display:block;font-size:11px;margin-bottom:5px}.base-consultation-row p{font-size:13px;line-height:1.7;color:#565149}.base-consultation-row.caution b{color:#8a352e}";
    document.head.appendChild(style);
  }

  function updateConsultationSection(content) {
    const facts = document.querySelector("#destiny-card .card-facts");
    const elementNode = document.getElementById("fact-element");
    if (!facts || !elementNode || !content || typeof content.base !== "function") return;
    const element = elementNode.textContent.replace(/^ธาตุ/, "").trim();
    const reading = content.base(element);
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
    ["decision", "visible", "strength", "caution"].forEach(function (key) {
      setText(section.querySelector('[data-base="' + key + '"]'), reading[key]);
    });
  }

  function updateHomeScienceCards(content) {
    document.querySelectorAll("#science-grid a[data-science-id]").forEach(function (card) {
      const id = card.dataset.scienceId;
      const title = card.querySelector("h3"), description = card.querySelector("p");
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
      const match = combined.textContent.match(/(\d+\/8)/);
      setText(combined, "โปรไฟล์รวม" + (match ? " · " + match[1] : ""));
    }
    updateConsultationSection(content);
    updateHomeScienceCards(content);
    const powerTitle = result.querySelector(".powers-title");
    setText(powerTitle, "ตัวชี้วัดเชิงสัญลักษณ์จากโปรไฟล์");
    const powerNote = result.querySelector(".power-note");
    setText(powerNote, "ค่าด้านล่างเป็นตัวชี้วัดเชิงสัญลักษณ์ที่สร้างอย่างคงที่จากวันเกิด ใช้เพื่อเปรียบเทียบมุมต่าง ๆ ของโปรไฟล์ ไม่ใช่คะแนนความสามารถหรือผลการวัดทางวิทยาศาสตร์");
  }

  function loadHomeContent() {
    if (!document.getElementById("profile-result")) return;
    function start() {
      const content = window.SorathaiContent;
      if (!content) return;
      enhanceHomeContent(content);
      const result = document.getElementById("profile-result");
      const grid = document.getElementById("science-grid");
      if (result) new MutationObserver(function () { enhanceHomeContent(content); }).observe(result, { attributes: true, attributeFilter: ["class"] });
      if (grid) new MutationObserver(function () { enhanceHomeContent(content); }).observe(grid, { childList: true });
    }
    if (window.SorathaiContent) { start(); return; }
    let script = document.querySelector('script[data-sorathai-content-loader]');
    if (!script) {
      script = document.createElement("script");
      script.src = "sorathai-content.js";
      script.async = true;
      script.dataset.sorathaiContentLoader = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", start, { once: true });
  }

  function init() {
    markDecorativeIcons();
    enhanceDrawer(document.getElementById("drw"));
    loadHomeContent();
    new MutationObserver(markDecorativeIcons).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
