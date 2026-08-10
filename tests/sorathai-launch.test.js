const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://sorathai.pages.dev';
const SCIENCES = [
  'thai-astrology.html',
  'western-astrology.html',
  'chinese-astrology.html',
  'numerology.html',
  'mayan.html',
  'biorhythm.html',
  'nakshatra.html',
  'celtic.html'
];
const NOINDEX = ['profile.html', 'dream-result.html'];
const PUBLIC_HTML = [
  'index.html', ...SCIENCES, 'profile.html', 'dream.html', 'dream-result.html',
  'about.html', 'privacy.html', 'contact.html'
];

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
  for (const route of NOINDEX) assert.equal(sitemap.includes(route), false, `${route} must not be in sitemap`);
});

test('default social preview asset exists and is a PNG', () => {
  const file = path.join(ROOT, 'og-image.png');
  assert.ok(fs.existsSync(file));
  const bytes = fs.readFileSync(file);
  assert.ok(bytes.length > 1000);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test('indexable science pages expose static context, canonical metadata and restrained schema', () => {
  for (const route of SCIENCES) {
    const source = read(route);
    assert.match(source, /data-sorathai-search-context="1"/, `${route}: missing crawlable science context`);
    assert.match(source, /data-sorathai-launch-schema="1"/, `${route}: missing WebPage launch schema`);
    assert.match(source, new RegExp(`<link rel="canonical" href="${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${route}"`));
    assert.ok(source.includes(`${ORIGIN}/og-image.png`), `${route}: social preview origin mismatch`);
  }
});

test('Home has WebSite schema and user-specific result shells are noindex', () => {
  assert.match(read('index.html'), /data-sorathai-launch-schema="1"/);
  for (const route of NOINDEX) {
    const source = read(route).toLowerCase();
    assert.match(source, /<meta name="robots" content="noindex,follow"/);
  }
});

test('public HTML no longer advertises the unconfigured sorathai.com origin', () => {
  for (const route of PUBLIC_HTML) {
    const source = read(route).toLowerCase();
    assert.equal(source.includes('https://sorathai.com'), false, `${route}: stale custom-domain URL`);
    assert.equal(source.includes('sorathai.com ·'), false, `${route}: stale custom-domain watermark`);
  }
});

test('image-export controls are labeled as save actions rather than native share actions', () => {
  const dream = read('dream-result.html');
  assert.match(dream, />บันทึกการ์ด<\/button>/);
  assert.equal(/>แชร์<\/button>/.test(dream), false);
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
