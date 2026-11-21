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
