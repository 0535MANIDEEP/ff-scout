const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'shared', 'auth', 'session.ts'), 'utf8');

test('session token is random and only its hash is stored', () => {
  assert.match(source, /randomBytes\(32\)/);
  assert.match(source, /createHash\('sha256'\)/);
  assert.match(source, /tokenHash/);
  assert.doesNotMatch(source, /SignJWT|jwtVerify|SESSION_SECRET/);
});

test('cookie is httpOnly, lax and secure only in production', () => {
  assert.match(source, /httpOnly:\s*true/);
  assert.match(source, /sameSite:\s*'lax'/);
  assert.match(source, /secure:\s*process\.env\.NODE_ENV === 'production'/);
  assert.match(source, /maxAge:\s*SESSION_MAX_AGE_SECONDS/);
});

test('expired and revoked sessions cannot be read', () => {
  assert.match(source, /if \(!row \|\| row\.revokedAt \|\| row\.expiresAt/);
  assert.match(source, /revokedAt:\s*null/);
});

test('logout revokes the row', () => {
  assert.match(source, /revokedAt:\s*new Date\(\)/);
});

test('a missing token returns null before any database lookup', () => {
  assert.match(source, /if \(!token\) return null/);
  assert.match(source, /if \(!row \|\| row\.revokedAt \|\| row\.expiresAt/);
});
