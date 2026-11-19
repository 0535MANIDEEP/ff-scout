const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// ff-upstream.ts is TypeScript and imports nothing, so compile just this module
// to a scratch dir and exercise the pure shaping function. No network, no DB.
const outDir = path.join(__dirname, '.ff-upstream-build');

test.before(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
  execSync(`npx tsc src/lib/ff-upstream.ts --module commonjs --target es2022 --skipLibCheck --outDir "${outDir}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
  });
});

test.after(() => fs.rmSync(outDir, { recursive: true, force: true }));

const load = () => require(path.join(outDir, 'ff-upstream.js'));

// Fixture mirrors the provider's documented example response.
const DOCS_EXAMPLE = {
  AccountInfo: {
    AccountName: 'PlayerName', AccountLevel: 82, AccountRegion: 'BD',
    AccountLikes: 39696, AccountLastLogin: '1766158301', AccountSeasonId: 48,
  },
  AccountProfileInfo: { BrMaxRank: 325, BrRankPoint: 5943, CsMaxRank: 319, CsRankPoint: 79 },
  GuildInfo: { GuildName: 'Test Guild', MemberNum: 42 },
  Token: 'secret-field-that-must-never-leave-the-server',
};

test('shapeProfile keeps only whitelisted fields', () => {
  const p = load().shapeProfile(DOCS_EXAMPLE);
  assert.deepEqual(
    Object.keys(p).sort(),
    ['brPoints', 'brRank', 'csPoints', 'csRank', 'guild', 'guildMembers', 'lastLogin', 'level', 'likes', 'nickname', 'region', 'season'],
  );
  assert.equal(p.nickname, 'PlayerName');
  assert.equal(p.level, 82);
  assert.equal(p.region, 'BD');
  assert.equal(p.guild, 'Test Guild');
  assert.equal(p.guildMembers, 42);
});

test('rank codes pass through raw — no invented tier names', () => {
  const p = load().shapeProfile(DOCS_EXAMPLE);
  assert.equal(p.brRank, 325);
  assert.equal(p.csRank, 319);
  assert.equal(p.brPoints, 5943);
});

test('shapeProfile returns null for an unreadable body', () => {
  assert.equal(load().shapeProfile(null), null);
  assert.equal(load().shapeProfile({}), null);
});

test('millisecond timestamps are treated as ms, seconds as seconds', () => {
  const ms = load().shapeProfile({ AccountInfo: { AccountName: 'A', AccountLastLogin: 1766158301000 } });
  const s = load().shapeProfile({ AccountInfo: { AccountName: 'A', AccountLastLogin: '1766158301' } });
  assert.equal(ms.lastLogin, s.lastLogin);
  assert.equal(typeof ms.lastLogin, 'string');
});

test('zero and junk values become null instead of fake numbers', () => {
  const p = load().shapeProfile({ AccountInfo: { AccountName: 'A', AccountLevel: 0, AccountLikes: 'n/a', AccountLastLogin: 0 } });
  assert.equal(p.level, null);
  assert.equal(p.likes, null);
  assert.equal(p.lastLogin, null);
});
