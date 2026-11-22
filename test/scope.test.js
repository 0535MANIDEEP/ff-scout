const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src');

test('no out-of-scope routes survive', () => {
  for (const p of ['app/sponsors', 'app/sponsor', 'app/admin/roles', 'app/api/waitlist']) {
    assert.equal(fs.existsSync(path.join(root, p)), false, `${p} still exists`);
  }
});

test('no appearance preset or jose import survives', () => {
  const files = [];
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else if (/\.(ts|tsx)$/.test(e.name)) files.push(full);
  });
  walk(root);
  const source = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  assert.doesNotMatch(source, /AppearanceControl|fc-appearance|from 'jose'/);
});

test('no sponsor-discovery copy or dead sponsor links survive', () => {
  const files = [];
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else if (/\.(ts|tsx)$/.test(e.name)) files.push(full);
  });
  walk(root);
  const source = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  for (const banned of ['/sponsor/sign-up', 'Sponsors scout the opted-in', 'candidate CSV', 'Sponsor visibility', 'setSponsorVisibility', 'Sponsor discovery is opt-in', 'Opt-in discovery', 'get noticed by sponsors']) {
    assert.ok(!source.includes(banned), `stale sponsor surface: ${banned}`);
  }
  assert.ok(!source.includes('visibleToSponsors'), 'legacy visibleToSponsors column must not be rendered');
});
