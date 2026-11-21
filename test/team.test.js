const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

// Pure team helpers, compiled standalone (pattern: test/schedule.test.js). No imports.
const outDir = path.join(__dirname, '.team-build');
test.before(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
  execSync(`npx tsc src/lib/team.ts --module commonjs --target es2022 --skipLibCheck --outDir "${outDir}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
  });
});
test.after(() => fs.rmSync(outDir, { recursive: true, force: true }));
const load = () => require(path.join(outDir, 'team.js'));

test('normalizeTeamName trims and collapses whitespace', () => {
  const s = load();
  assert.equal(s.normalizeTeamName('  Alpha  Squad  '), 'Alpha Squad');
  assert.equal(s.normalizeTeamName('Alpha'), 'Alpha');
  assert.equal(s.normalizeTeamName(''), '');
  assert.equal(s.normalizeTeamName(null), '');
  assert.equal(s.normalizeTeamName(undefined), '');
});

test('isValidTeamName accepts 2..30 chars, rejects the rest', () => {
  const s = load();
  assert.equal(s.isValidTeamName('A'), false);
  assert.equal(s.isValidTeamName('Al'), true);
  assert.equal(s.isValidTeamName('Alpha Squad'), true);
  assert.equal(s.isValidTeamName(''), false);
  assert.equal(s.isValidTeamName(null), false);
  assert.equal(s.isValidTeamName('A'.repeat(30)), true);
  assert.equal(s.isValidTeamName('A'.repeat(31)), false);
});

test('teamKey: trimmed + case-folded for sorting/grouping', () => {
  const s = load();
  assert.equal(s.teamKey(' Alpha Squad '), 'alphasquad');
  assert.equal(s.teamKey('ALPHA SQUAD'), 'alphasquad');
  assert.equal(s.teamKey(null), '');
});

test('sortByTeamKey: trimmed/case-folded order, empty first, stable', () => {
  const s = load();
  const rows = [{ name: 'Bravo' }, { name: null }, { name: 'Alpha' }];
  const sorted = s.sortByTeamKey(rows, (r) => r.name);
  assert.deepEqual(sorted.map((r) => r.name), [null, 'Alpha', 'Bravo']);
});
