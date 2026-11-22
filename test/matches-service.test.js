const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'matches', 'service.ts'), 'utf8');
const actionSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'post', 'actions.ts'), 'utf8');

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

test('joins store the normalized squad name for esports and competitive', () => {
  assert.match(source, /joinMatch\(matchId: string, teamName: string \| null\)/);
  assert.match(source, /const teamStored = match\.mode === 'esports' \|\| match\.mode === 'competitive' \? teamName \|\| null : null/);
  assert.match(source, /data: \{ matchId, playerId: user\.id, teamName: teamStored \}/);
});

test('post validation runs in the service after the pause and rate gates', () => {
  assert.match(source, /matchSchemas\.create\.safeParse\(input\)/);
  assert.match(source, /throw new Error\('INVALID'\)/);
  assert.doesNotMatch(actionSource, /safeParse/);
  assert.match(actionSource, /createMatchInService\(input\)/);
  assert.match(actionSource, /err\.message === 'INVALID'.*\/post\?e=invalid/);
});

test('unlimited-slot joins recheck open status inside the transaction', () => {
  assert.match(source, /const stillOpen = await tx\.match\.count\(\{ where: \{ id: matchId, status: 'open' \} \}\)/);
  assert.match(source, /if \(stillOpen === 0\) return \{ ok: false, reason: 'CLOSED' \}/);
});
