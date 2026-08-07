const test = require("node:test");
const assert = require("node:assert/strict");
const { drawerTriggerFrom } = require("../sorathai-site.js");

test("selects the exact drawer trigger from a clicked descendant", () => {
  const trigger = { id: "more-control" };
  const icon = {
    closest(selector) {
      assert.equal(selector, '[onclick*="openDrw"]');
      return trigger;
    }
  };

  assert.equal(drawerTriggerFrom(icon), trigger);
});

test("ignores interaction targets outside the drawer trigger", () => {
  const unrelated = { closest: () => null };
  assert.equal(drawerTriggerFrom(unrelated), null);
  assert.equal(drawerTriggerFrom(null), null);
});
