const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src', 'app');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const PUBLIC_PAGES = [
  'page.tsx',
  'components/Hero.tsx',
  'about/page.tsx',
  'advertise/page.tsx',
  'faq/page.tsx',
  'safety/page.tsx',
  'terms/page.tsx',
  'privacy/page.tsx',
  'learn/page.tsx',
  'loadout/page.tsx',
  'matches/page.tsx',
];

test('public copy has no em dash or template filler', () => {
  for (const rel of PUBLIC_PAGES) {
    const source = read(rel);
    assert.doesNotMatch(source, /\u2014/, `em dash in ${rel}`);
    assert.doesNotMatch(source, /honest board|gatekeeper|FIG\. 2|fabricated authority/, `filler in ${rel}`);
  }
});

test('home cards stretch to one height', () => {
  const home = read('page.tsx');
  assert.doesNotMatch(home, /FIG\. 2/);
  assert.equal((home.match(/<Reveal className="h-full"/g) || []).length, 3);
  assert.equal((home.match(/<article className=\{`\$\{CARD\} h-full`\}/g) || []).length, 3);
});

test('reading pages use one consistent section treatment', () => {
  for (const rel of ['advertise/page.tsx', 'safety/page.tsx']) {
    const source = read(rel);
    assert.doesNotMatch(source, /const CARD =/, `lone card in ${rel}`);
    assert.doesNotMatch(source, /className=\{`mt-6 \$\{CARD\}`\}/, `lone card usage in ${rel}`);
  }
  const loadout = read('loadout/page.tsx');
  assert.match(loadout, /\$\{CARD\} p-6/);
  assert.doesNotMatch(loadout, /\$\{CARD\} p-4/);
});
