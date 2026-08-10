const test = require('node:test');
const assert = require('node:assert/strict');
const Events = require('../sorathai-events.js');

test('unknown events are rejected', () => {
  assert.equal(Events.sanitize('dob_submitted', { dob: '01011990' }), null);
});

test('payload is allowlisted and sensitive/free-form fields are dropped', () => {
  const result = Events.sanitize('science_opened', {
    scienceId: 'western',
    dob: '01011990',
    birthDate: '1990-01-01',
    age: 36,
    url: '?dob=01011990',
    dreamText: 'ฉันฝันว่า...',
    readingText: 'ข้อความคำอ่าน',
    email: 'person@example.com',
    profile: { dob: '1990-01-01' }
  });
  assert.deepEqual(result, { name: 'science_opened', payload: { scienceId: 'western' } });
});

test('invalid enum values are removed rather than transmitted', () => {
  assert.deepEqual(
    Events.sanitize('focus_selected', { scienceId: 'western', focus: 'secret-free-form-value' }),
    { name: 'focus_selected', payload: { scienceId: 'western' } }
  );
});

test('combined explored counts are bucketed without exposing exact profile state', () => {
  assert.equal(Events.exploredBucket(0), '0-1');
  assert.equal(Events.exploredBucket(2), '2-3');
  assert.equal(Events.exploredBucket(5), '4-7');
  assert.equal(Events.exploredBucket(8), '8');
});

test('emit is a local no-op contract and returns only sanitized data', () => {
  assert.deepEqual(
    Events.emit('export_failed', { surface: 'deep', reason: 'render_failed', error: 'raw stack trace' }),
    { name: 'export_failed', payload: { surface: 'deep', reason: 'render_failed' } }
  );
});
