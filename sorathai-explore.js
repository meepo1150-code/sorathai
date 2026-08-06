(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SorathaiExplore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const LABELS = Object.freeze({ identity: "ตัวตน", love: "ความรัก", career: "การงาน", challenge: "จุดท้าทาย" });
  function validFocus(value) { return Object.prototype.hasOwnProperty.call(LABELS, value); }
  function destination(href, profile, focus) {
    return root.SorathaiProfile.readingUrl(href, profile, focus);
  }

  function enhance(container, getProfile) {
    if (!container || !root.document) return;
    if (container.dataset.exploreEnhanced) return;
    container.dataset.exploreEnhanced = "true";
    let trigger = null, href = "", scienceId = "", title = "", pushed = false;
    const backdrop = document.createElement("div");
    backdrop.className = "explore-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = '<section class="explore-sheet" role="dialog" aria-modal="true" aria-labelledby="explore-title" aria-describedby="explore-opening"><button class="explore-close" type="button" aria-label="ปิด">×</button><p class="explore-kicker">A quiet passage</p><h2 id="explore-title">เลือกมุมที่อยากสำรวจ</h2><p id="explore-opening" class="explore-opening"></p><div class="explore-focus"><button data-focus="identity">ตัวตน<small>สิ่งที่เป็นแก่นของคุณ</small></button><button data-focus="love">ความรัก<small>รูปแบบการเชื่อมโยง</small></button><button data-focus="career">การงาน<small>แรงขับและเส้นทาง</small></button><button data-focus="challenge">จุดท้าทาย<small>บทเรียนที่ควรมองเห็น</small></button></div><button class="explore-skip" type="button">ข้ามและเปิดคำอ่าน</button></section>';
    document.body.appendChild(backdrop);
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
      backdrop.querySelector(".explore-opening").textContent = "จากเส้นทางวันเกิดของคุณ “" + title + "” อาจเผยอีกมุมหนึ่ง เลือกเพียงสิ่งที่อยากรับฟังในตอนนี้";
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
    label.textContent = "มุมคำอ่าน · " + LABELS[focus];
    const target = document.querySelector(".rh");
    if (target) target.insertAdjacentElement("afterend", label);
  }
  return { LABELS, validFocus, destination, enhance, readingContext };
});
