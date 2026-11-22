const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'identity', 'schema.ts'), 'utf8');

test('login schema validates a real email and a non-blank password', () => {
  assert.match(source, /login:\s*z\.object\(/);
  assert.match(source, /email:\s*z\.email\(\)/);
  assert.match(source, /password:\s*z\.string\(\)\.min\(1\)/);
});

test('signup schema requires explicit age confirmation and no unstored fields', () => {
  assert.match(source, /signUp:\s*z\.object\(/);
  assert.match(source, /password:\s*z\.string\(\)\.min\(8\)/);
  assert.match(source, /displayName:\s*z\.string\(\)\.trim\(\)\.min\(2\)\.max\(40\)/);
  assert.doesNotMatch(source, /college:/);
  assert.match(source, /ageConfirmed:\s*z\.literal\(true\)/);
  assert.doesNotMatch(source, /ageConfirmed:\s*z\.boolean\(\)/);
});
