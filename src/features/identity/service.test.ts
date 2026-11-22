import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identitySchemas } from './schema';

test('login schema rejects a blank password and a bad email', () => {
  assert.equal(identitySchemas.login.safeParse({ email: 'not-an-email', password: 'x' }).success, false);
  assert.equal(identitySchemas.login.safeParse({ email: 'a@b.com', password: '' }).success, false);
  assert.equal(identitySchemas.login.safeParse({ email: 'a@b.com', password: 'ok' }).success, true);
});

test('signup schema requires explicit age confirmation and a location', () => {
  const base = { email: 'a@b.com', password: 'longenough', displayName: 'Player', college: 'VJIT Hyderabad' };
  assert.equal(identitySchemas.signUp.safeParse({ ...base, ageConfirmed: false }).success, false);
  assert.equal(identitySchemas.signUp.safeParse({ ...base, ageConfirmed: true }).success, true);
  assert.equal(identitySchemas.signUp.safeParse({ ...base, ageConfirmed: true, college: '' }).success, false);
});
