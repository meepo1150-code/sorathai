const test = require('node:test');
const assert = require('node:assert/strict');

const Events = require('../sorathai-events.js');
globalThis.SorathaiEvents = Events;
const Explore = require('../sorathai-explore.js');

test('exploration instrumentation emits only registered allow-listed payloads', () => {
  assert.deepEqual(
    Explore.emitEvent('science_opened', { scienceId: 'western', dob: '1990-01-01' }),
    { name: 'science_opened', payload: { scienceId: 'western' } }
  );
  assert.deepEqual(
    Explore.emitEvent('focus_selected', { scienceId: 'western', focus: 'career', readingText: 'private' }),
    { name: 'focus_selected', payload: { scienceId: 'western', focus: 'career' } }
  );
  assert.deepEqual(
    Explore.emitEvent('deep_reading_viewed', { scienceId: 'western', focus: 'none', profile: { dob: '1990-01-01' } }),
    { name: 'deep_reading_viewed', payload: { scienceId: 'western', focus: 'none' } }
  );
});

test('core funnel instrumentation uses only coarse registered payloads', () => {
  assert.deepEqual(Explore.emitEvent('base_profile_created', { dob: '1990-01-01' }), {
    name: 'base_profile_created', payload: {}
  });
  assert.deepEqual(Explore.emitEvent('combined_opened', { exploredBucket: '4-7', dob: '1990-01-01' }), {
    name: 'combined_opened', payload: { exploredBucket: '4-7' }
  });
  assert.deepEqual(Explore.emitEvent('export_attempted', { surface: 'base', filename: 'private.png' }), {
    name: 'export_attempted', payload: { surface: 'base' }
  });
  assert.deepEqual(Explore.emitEvent('export_succeeded', { surface: 'base', readingText: 'private' }), {
    name: 'export_succeeded', payload: { surface: 'base' }
  });
  assert.deepEqual(Explore.emitEvent('export_failed', { surface: 'base', reason: 'render_failed', error: 'stack' }), {
    name: 'export_failed', payload: { surface: 'base', reason: 'render_failed' }
  });
});

test('exploration instrumentation remains harmless when the event layer is unavailable', () => {
  const previous = globalThis.SorathaiEvents;
  delete globalThis.SorathaiEvents;
  assert.equal(Explore.emitEvent('science_opened', { scienceId: 'western' }), null);
  globalThis.SorathaiEvents = previous;
});

test('all local instrumentation payloads pass the strict M14 contract', () => {
  const cases = [
    ['science_opened', { scienceId: 'thai' }],
    ['focus_selected', { scienceId: 'thai', focus: 'none' }],
    ['deep_reading_viewed', { scienceId: 'thai', focus: 'identity' }],
    ['base_profile_created', {}],
    ['combined_opened', { exploredBucket: '2-3' }],
    ['export_attempted', { surface: 'base' }],
    ['export_succeeded', { surface: 'base' }],
    ['export_failed', { surface: 'base', reason: 'library_unavailable' }]
  ];
  cases.forEach(([name, payload]) => {
    assert.deepEqual(Events.validate(name, payload), { valid: true, errors: [] });
  });
});
