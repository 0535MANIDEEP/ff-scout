const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const schema = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');

test('schema has the match-posting and join models', () => {
  assert.match(schema, /model Match \{/);
  assert.match(schema, /model MatchEntry \{/);
});

test('Match carries the platform taxonomy', () => {
  const match = schema.slice(schema.indexOf('model Match {'), schema.indexOf('model MatchEntry'));
  for (const field of ['organizerId', 'title', 'mode', 'gameType', 'entry', 'entryFee', 'prize', 'prizePool', 'status', 'date', 'city', 'online', 'slots', 'contact', 'notes']) {
    assert.ok(match.includes(field), `Match is missing ${field}`);
  }
});

test('MatchEntry is unique per match+player', () => {
  const entry = schema.slice(schema.indexOf('model MatchEntry {'));
  assert.match(entry, /@@unique\(\[matchId, playerId\]\)/);
});

test('MatchSeries model carries template + recurrence + lifecycle fields', () => {
  const s = schema.slice(schema.indexOf('model MatchSeries {'), schema.indexOf('model Match {', schema.indexOf('model MatchSeries {')));
  for (const f of ['organizerId', 'title', 'mode', 'gameType', 'entry', 'entryFee', 'prize', 'prizePool', 'city', 'slots', 'durationMinutes', 'dayOfWeek', 'startTimeLocal', 'timezone', 'status', 'lookaheadWeeks', 'lastGeneratedAt', 'resumedAt']) {
    assert.ok(s.includes(f), `MatchSeries is missing ${f}`);
  }
});

test('Match gains non-null endsAt + nullable seriesId + unique([seriesId, date])', () => {
  const match = schema.slice(schema.indexOf('model Match {'), schema.indexOf('model MatchEntry'));
  assert.match(match, /endsAt\s+DateTime(\s*;|\s*\/\/)/);
  assert.match(match, /seriesId\s+String\?/);
  assert.match(match, /series\s+MatchSeries\?/);
  assert.match(match, /@@unique\(\[seriesId, date\]\)/);
});

test('User carries separate BR/CS ranks, UID and sponsor opt-in', () => {
  const user = schema.slice(schema.indexOf('model User {'), schema.indexOf('model Match {'));
  for (const field of ['brRank', 'csRank', 'visibleToSponsors', 'gameUid', 'brandName']) {
    assert.ok(user.includes(field), `User is missing ${field}`);
  }
  for (const gone of ['verified', 'iglCapable', 'college   String?', 'rank          String']) {
    assert.ok(!user.includes(gone), `User still has ${gone}`);
  }
});

test('verification subsystem and the moderator/organizer roles are gone', () => {
  assert.doesNotMatch(schema, /model VerificationProof \{/);
  assert.doesNotMatch(schema, /moderator/);
  assert.doesNotMatch(schema, /^  organizer$/m);
  assert.match(schema, /sponsor/);
});

test('a player can report a match once', () => {
  assert.match(schema, /model Report \{/);
  const report = schema.slice(schema.indexOf('model Report {'));
  assert.match(report, /@@unique\(\[matchId, reporterId\]\)/);
});
