const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'config', 'match.json'), 'utf8'));

test('match taxonomy covers modes, BR/CS, entry, prize, status', () => {
  assert.deepEqual(json.modes, ['casual', 'competitive', 'ranked', 'esports']);
  assert.deepEqual(json.gameTypes, ['BR', 'CS', 'BR/CS']);
  assert.deepEqual(json.entry, ['free', 'paid']);
  assert.deepEqual(json.prize, ['none', 'pool']);
  assert.deepEqual(json.status, ['open', 'closed']);
});

test('match config carries scheduled-matches ladder, cadence, duration, and sweep keys', () => {
  assert.equal(json.trustLadderMinMatches, 3);
  assert.equal(json.trustLadderMinJoins, 2);
  assert.equal(json.activeSeriesCap, 2);
  assert.equal(json.lookaheadWeeks, 2);
  assert.equal(json.autoPauseAfterDeadOccurrences, 2);
  assert.deepEqual(json.durationOptionsMinutes, [60, 90, 120]);
  assert.equal(json.defaultDurationMinutes, 90);
  assert.ok(json.durationOptionsMinutes.includes(json.defaultDurationMinutes), 'default must be a valid option');
  assert.equal(json.lazyGenThrottleMinutes, 15);
});
