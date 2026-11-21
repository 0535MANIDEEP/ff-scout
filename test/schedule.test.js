const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

// Pure schedule logic, compiled standalone via tsc (no imports). Pattern: test/ff-upstream.test.js.
const outDir = path.join(__dirname, '.schedule-build');
test.before(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
  execSync(`npx tsc src/lib/schedule.ts --module commonjs --target es2022 --skipLibCheck --outDir "${outDir}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
  });
});
test.after(() => fs.rmSync(outDir, { recursive: true, force: true }));
const load = () => require(path.join(outDir, 'schedule.js'));

const t = (iso) => new Date(iso);

test('istDayOfWeek: matches UTC day-of-week of (t + 05:30); no hardcoded facts', () => {
  const s = load();
  for (const iso of ['2026-11-21T18:00:00Z', '2026-11-21T20:00:00Z', '2026-11-22T10:00:00Z', '2026-11-23T02:00:00Z', '2026-11-23T00:00:00Z']) {
    const d = t(iso);
    assert.equal(s.istDayOfWeek(d), new Date(d.getTime() + s.IST_OFFSET_MS).getUTCDay(), `wrong day for ${iso}`);
  }
});

test('nextOccurrenceDates: weekly cadence, strictly after `from`, lands on dayOfWeek in IST', () => {
  const s = load();
  const now = t('2026-11-21T10:00:00Z');
  const dayOfWeek = s.istDayOfWeek(now);
  const dates = s.nextOccurrenceDates(now, dayOfWeek, '20:00', 2);
  assert.equal(dates.length, 2);
  assert.ok(dates[0].getTime() > now.getTime(), 'first occurrence strictly after now');
  assert.equal(s.istDayOfWeek(dates[0]), dayOfWeek, 'first lands on the right IST day');
  assert.equal(s.istDayOfWeek(dates[1]), dayOfWeek, 'second lands on the right IST day');
  assert.equal(dates[1].getTime() - dates[0].getTime(), 7 * 86_400_000, 'exactly weekly apart');
  assert.ok(dates[0].getTime() - now.getTime() < 7 * 86_400_000, 'within one week of now');
});

test('nextOccurrenceDates: crosses month boundary', () => {
  const s = load();
  const now = t('2026-10-01T10:00:00Z');
  const dayOfWeek = s.istDayOfWeek(now);
  const dates = s.nextOccurrenceDates(now, dayOfWeek, '20:00', 2);
  assert.ok(dates[0].getTime() > now.getTime());
  assert.equal(s.istDayOfWeek(dates[0]), dayOfWeek);
});

test('endsAtFor: date + durationMinutes', () => {
  const s = load();
  const d = t('2026-11-21T14:30:00Z');
  assert.equal(s.endsAtFor(d, 90).getTime(), d.getTime() + 90 * 60_000);
  assert.equal(s.endsAtFor(d, 60).getTime(), d.getTime() + 60 * 60_000);
});

test('qualifiesMatch: status-independent, host excluded, endsAt gate', () => {
  const s = load();
  const now = t('2026-11-21T10:00:00Z');
  const host = 'host1';
  // closed match still qualifies (good host behavior)
  assert.equal(s.qualifiesMatch(host, t(now.getTime() - 1000), [host, 'a', 'b'], now, 2), true);
  // host join is excluded
  assert.equal(s.qualifiesMatch(host, t(now.getTime() - 1000), [host, 'a', host], now, 2), false);
  // duplicates count once
  assert.equal(s.qualifiesMatch(host, t(now.getTime() - 1000), ['a', 'a', 'a'], now, 2), false);
  assert.equal(s.qualifiesMatch(host, t(now.getTime() - 1000), ['a', 'b'], now, 2), true);
  // future endsAt or exactly now -> false
  assert.equal(s.qualifiesMatch(host, t(now.getTime() + 1000), ['a', 'b'], now, 2), false);
  assert.equal(s.qualifiesMatch(host, t(now.getTime()), ['a', 'b'], now, 2), false);
});

test('shouldAutoPause: latest N finished occurrences all zero-join', () => {
  const s = load();
  assert.equal(s.shouldAutoPause([0], 2), false);
  assert.equal(s.shouldAutoPause([0, 0], 2), true);
  assert.equal(s.shouldAutoPause([0, 1], 2), false);
  assert.equal(s.shouldAutoPause([0, 0, 0].slice(-2), 2), true); // caller passes the latest N
});

test('seriesCueLabel: honest chip format', () => {
  const s = load();
  assert.equal(s.seriesCueLabel(5, '20:00'), 'Weekly · Fri 8 PM IST');
  assert.equal(s.seriesCueLabel(0, '08:00'), 'Weekly · Sun 8 AM IST');
  assert.equal(s.seriesCueLabel(1, '23:30'), 'Weekly · Mon 11:30 PM IST');
});
