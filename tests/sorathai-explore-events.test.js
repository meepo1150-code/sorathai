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

test('exploration instrumentation remains harmless when the event layer is unavailable', () => {
  const previous = globalThis.SorathaiEvents;
  delete globalThis.SorathaiEvents;
  assert.equal(Explore.emitEvent('science_opened', { scienceId: 'western' }), null);
  globalThis.SorathaiEvents = previous;
});

test('all exploration payloads pass the strict M14 contract', () => {
  assert.deepEqual(Events.validate('science_opened', { scienceId: 'thai' }), { valid: true, errors: [] });
  assert.deepEqual(Events.validate('focus_selected', { scienceId: 'thai', focus: 'none' }), { valid: true, errors: [] });
  assert.deepEqual(Events.validate('deep_reading_viewed', { scienceId: 'thai', focus: 'identity' }), { valid: true, errors: [] });
});
