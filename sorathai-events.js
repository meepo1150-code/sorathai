(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SorathaiEvents = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var EVENT_FIELDS = Object.freeze({
    base_profile_created: [],
    base_profile_restored: [],
    science_opened: ['scienceId'],
    focus_selected: ['scienceId', 'focus'],
    deep_reading_viewed: ['scienceId', 'focus'],
    combined_opened: ['exploredBucket'],
    dream_started: [],
    dream_result_viewed: [],
    export_attempted: ['surface'],
    export_succeeded: ['surface'],
    export_failed: ['surface', 'reason']
  });

  var ENUMS = Object.freeze({
    scienceId: ['thai', 'western', 'chinese', 'numerology', 'mayan', 'biorhythm', 'nakshatra', 'celtic'],
    focus: ['identity', 'love', 'career', 'challenge', 'none'],
    exploredBucket: ['0-1', '2-3', '4-7', '8'],
    surface: ['base', 'deep', 'combined', 'dream'],
    reason: ['library_unavailable', 'render_failed', 'download_failed', 'unknown']
  });

  function sanitize(name, payload) {
    if (!Object.prototype.hasOwnProperty.call(EVENT_FIELDS, name)) return null;
    var source = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    var clean = {};
    EVENT_FIELDS[name].forEach(function (field) {
      var value = source[field];
      if (ENUMS[field] && ENUMS[field].indexOf(value) !== -1) clean[field] = value;
    });
    return { name: name, payload: clean };
  }

  function exploredBucket(count) {
    var n = Number(count);
    if (!Number.isFinite(n) || n < 2) return '0-1';
    if (n < 4) return '2-3';
    if (n < 8) return '4-7';
    return '8';
  }

  function emit(name, payload) {
    // Deliberately no-op in Milestone 10. No analytics provider or network transport
    // is enabled until a later explicit privacy/provider decision is made.
    return sanitize(name, payload);
  }

  return Object.freeze({
    EVENT_FIELDS: EVENT_FIELDS,
    sanitize: sanitize,
    exploredBucket: exploredBucket,
    emit: emit
  });
});
