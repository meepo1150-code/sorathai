const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://sorathai.pages.dev';

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

test('robots and sitemap use one verified production origin', () => {
  const robots = read('robots.txt');
  const sitemap = read('sitemap.xml');
  assert.match(robots, new RegExp(`Sitemap: ${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`));
  const locations = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locations.length >= 10);
  assert.ok(locations.every((url) => url === `${ORIGIN}/` || url.startsWith(`${ORIGIN}/`)));
  assert.ok(!sitemap.includes('https://sorathai.com'));
  assert.ok(!sitemap.includes('github.io'));
});

test('default social preview asset exists and is a PNG', () => {
  const file = path.join(ROOT, 'og-image.png');
  assert.ok(fs.existsSync(file));
  const bytes = fs.readFileSync(file);
  assert.ok(bytes.length > 1000);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test('measurement contract contains no network transport primitives', () => {
  const source = read('sorathai-events.js').toLowerCase();
  for (const marker of ['fetch(', 'xmlhttprequest', 'websocket(', 'sendbeacon(', 'navigator.sendbeacon']) {
    assert.equal(source.includes(marker), false, `unexpected network marker: ${marker}`);
  }
});

test('launch documentation does not advertise the unconfigured custom domain', () => {
  const launch = read('docs/LAUNCH_CHECKLIST.md');
  assert.match(launch, /https:\/\/sorathai\.pages\.dev\//);
  assert.equal(launch.includes('https://sorathai.com'), false);
});
