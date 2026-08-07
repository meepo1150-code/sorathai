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

  function init() {
    markDecorativeIcons();
    enhanceDrawer(document.getElementById("drw"));
    new MutationObserver(markDecorativeIcons).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
