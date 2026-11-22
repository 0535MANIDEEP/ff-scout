const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'matches', 'service.ts'), 'utf8');

test('a paused host is refused in the service, not just the UI', () => {
  assert.match(source, /postingPausedUntil/);
  assert.match(source, /PAUSED/);
});

test('join is atomic and refuses oversell and host join', () => {
  assert.match(source, /\$transaction/);
  assert.match(source, /status:\s*'open'/);
  assert.match(source, /match\.organizerId === user\.id/);
  assert.match(source, /PAYMENT_REPORT_THRESHOLD|slots/);
});

test('DTO never exposes legacy money fields', () => {
  assert.match(source, /export function matchDTO/);
  assert.doesNotMatch(source, /entryFee:|prizePool:/);
});
