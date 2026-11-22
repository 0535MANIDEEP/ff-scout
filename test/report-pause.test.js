const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = read('src/features/reports/service.ts');
const schema = read('src/features/reports/schema.ts');
const action = read('src/app/matches/[id]/actions.ts');

test('only joined reporters count', () => {
  assert.match(source, /reporter:\s*\{\s*entries:\s*\{\s*some:/);
  assert.match(source, /PAYMENT_REPORT_CATEGORY/);
});

test('threshold is two and a third report does not extend the pause', () => {
  assert.match(source, /PAYMENT_REPORT_THRESHOLD/);
  assert.match(source, /joinedReports < PAYMENT_REPORT_THRESHOLD/);
  assert.match(source, /postingPausedUntil:\s*null/);
  assert.match(source, /PAYMENT_REPORT_PAUSE_DAYS/);
});

test('reason stays capped at the shipped 300 characters', () => {
  assert.match(schema, /\.max\(300\)/);
  assert.doesNotMatch(schema, /\.max\(500\)/);
});

test('the thin action preserves shipped redirects, revalidation and post-transaction audit', () => {
  assert.match(action, /\?e=reported/);
  assert.match(action, /\?reported=1/);
  assert.match(action, /&enforced=1/);
  assert.match(action, /revalidatePath\('\/player\/posted'\)/);
  assert.match(action, /action: 'report:auto_pause'/);
  assert.match(action, /audit must not block enforcement/);
});

test('the service does not write the audit log inside the transaction', () => {
  assert.doesNotMatch(source, /tx\.auditLog\.create/);
});
