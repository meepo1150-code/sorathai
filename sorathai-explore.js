(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiExplore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const FALLBACK_LABELS = Object.freeze({ identity: "ตัวตน", love: "ความรัก", career: "การงาน", challenge: "จุดที่ควรระวัง" });
  const LABELS = root.SorathaiContent && root.SorathaiContent.FOCUS
    ? Object.freeze(Object.fromEntries(Object.entries(root.SorathaiContent.FOCUS).map(([id, item]) => [id, item.label])))
    : FALLBACK_LABELS;
  function validFocus(value) { return Object.prototype.hasOwnProperty.call(LABELS, value); }
  function destination(href, profile, focus) {
    return root.SorathaiProfile.readingUrl(href, profile, focus);
  }
  function focusCopy(id) {
    if (root.SorathaiContent && root.SorathaiContent.FOCUS && root.SorathaiContent.FOCUS[id]) return root.SorathaiContent.FOCUS[id];
    const fallback = {
      identity: { question: "อยากเข้าใจตัวเองให้ชัดขึ้น", note: "นิสัย แรงขับ และจุดแข็งที่เป็นธรรมชาติของคุณ" },
      love: { question: "อยากดูเรื่องความรัก", note: "รูปแบบความสัมพันธ์และสิ่งที่คุณต้องการจากคนใกล้ชิด" },
      career: { question: "อยากรู้เรื่องงานและเส้นทางที่เหมาะกับฉัน", note: "วิธีทำงาน แรงจูงใจ และสภาพแวดล้อมที่ส่งเสริมคุณ" },
      challenge: { question: "อยากรู้ว่าอะไรที่มักทำให้ฉันติดขัด", note: "นิสัยหรือรูปแบบเดิมที่ควรรู้ทันและใช้ให้สมดุล" }
    };
    return fallback[id];
  }

  function enhance(container, getProfile) {
    if (!container || !root.document) return;
    if (container.dataset.exploreEnhanced) return;
    container.dataset.exploreEnhanced = "true";
    let trigger = null, href = "", scienceId = "", title = "", pushed = false;
    const backdrop = document.createElement("div");
    backdrop.className = "explore-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="explore-sheet" role="dialog" aria-modal="true" aria-labelledby="explore-title" aria-describedby="explore-opening"><button class="explore-close" type="button" aria-label="ปิด">×</button><p class="explore-kicker">เลือกเรื่องที่อยากดู</p><h2 id="explore-title">วันนี้อยากรู้เรื่องไหนมากที่สุด?</h2><p id="explore-opening" class="explore-opening"></p><div class="explore-focus"><button data-focus="identity"><span></span><small></small></button><button data-focus="love"><span></span><small></small></button><button data-focus="career"><span></span><small></small></button><button data-focus="challenge"><span></span><small></small></button></div><button class="explore-skip" type="button">ยังไม่เลือกเรื่อง เปิดคำอ่านทั้งหมด</button></section>';
    document.body.appendChild(backdrop);
    ["identity", "love", "career", "challenge"].forEach(function (id) {
      const button = backdrop.querySelector('[data-focus="' + id + '"]'), copy = focusCopy(id);
      button.querySelector("span").textContent = copy.question;
      button.querySelector("small").textContent = copy.note;
    });
    const sheet = backdrop.querySelector(".explore-sheet");
    const closeButton = backdrop.querySelector(".explore-close");
    function close(fromHistory) {
      if (backdrop.hidden) return;
      backdrop.hidden = true; document.body.classList.remove("explore-open");
      if (pushed && !fromHistory) history.back();
      pushed = false;
      if (trigger && trigger.isConnected) trigger.focus();
    }
    function open(link) {
      trigger = link; href = link.href; scienceId = link.dataset.scienceId || ""; title = link.dataset.scienceName || link.textContent.trim();
      const scienceName = root.SorathaiContent && root.SorathaiContent.scienceName ? root.SorathaiContent.scienceName(scienceId) : title;
      backdrop.querySelector(".explore-opening").textContent = scienceName + " จะอ่านวันเกิดเดียวกันจากอีกมุมหนึ่ง เลือกเรื่องที่คุณอยากเข้าใจมากที่สุด แล้วคำอ่านจะพาเรื่องนั้นขึ้นมาให้เห็นก่อน";
      backdrop.hidden = false; document.body.classList.add("explore-open");
      history.pushState({ sorathaiExplore: true }, ""); pushed = true;
      closeButton.focus();
    }
    function go(focus) {
      const profile = getProfile();
      const updated = root.SorathaiProfile.markScienceExplored(profile, scienceId, focus);
      if (updated) root.SorathaiProfile.save(updated);
      location.assign(destination(href, updated || profile, focus));
    }
    container.addEventListener("click", function (event) {
      const link = event.target.closest("a[data-science-id]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); open(link);
    });
    backdrop.addEventListener("click", function (event) {
      const focus = event.target.closest("[data-focus]");
      if (focus) go(focus.dataset.focus);
      else if (event.target.closest(".explore-skip")) go(null);
      else if (event.target === backdrop || event.target.closest(".explore-close")) close(false);
    });
    document.addEventListener("keydown", function (event) {
      if (backdrop.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); close(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(sheet.querySelectorAll("button:not([disabled])"));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    addEventListener("popstate", function () { if (!backdrop.hidden) close(true); });
  }

  function readingContext(scienceId) {
    if (!root.document || !root.SorathaiProfile) return;
    const params = new URLSearchParams(location.search), focus = params.get("focus");
    const profile = root.SorathaiProfile.fromLocation(location.search);
    if (profile) root.SorathaiProfile.save(root.SorathaiProfile.markScienceExplored(profile, scienceId, focus));
    if (!validFocus(focus)) return;
    const label = document.createElement("p"); label.className = "focus-context";
    label.textContent = "เรื่องที่คุณอยากดูเป็นพิเศษ · " + LABELS[focus];
    const target = document.querySelector(".rh");
    if (target) target.insertAdjacentElement("afterend", label);
  }
  return { LABELS, validFocus, destination, enhance, readingContext };
});
