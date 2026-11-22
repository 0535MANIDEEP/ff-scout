const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = rel => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const capsFor = (source, role) => source.match(new RegExp(`${role}:\\s*\\[([^\\]]*)\\]`))[1];

test('admin match console requires a capability players do not have', () => {
  const permissions = read('src/shared/auth/permissions.ts');
  assert.match(permissions, /'match:moderate'/);
  assert.match(capsFor(permissions, 'admin'), /match:moderate/);
  assert.doesNotMatch(capsFor(permissions, 'player'), /match:moderate/);

  const page = read('src/app/admin/matches/page.tsx');
  assert.match(page, /'match:moderate'/);
  const actions = read('src/app/admin/matches/actions.ts');
  assert.equal((actions.match(/'match:moderate'/g) || []).length, 2, 'both admin actions must be gated');
});

test('host actions keep their own match:manage capability', () => {
  assert.match(read('src/app/player/posted/actions.ts'), /'match:manage'/);
});

test('both leave paths delegate to one guarded transactional service', () => {
  const service = read('src/features/matches/service.ts');
  assert.match(service, /export async function leaveMatch\(matchId: string\)/);
  assert.match(service, /prisma\.\$transaction/);
  assert.match(service, /deleted\.count !== 1/);
  assert.match(service, /slots:\s*\{\s*not:\s*null\s*\}/);
  assert.match(service, /slots:\s*\{\s*increment:\s*1\s*\}/);

  for (const rel of ['src/app/player/actions.ts', 'src/app/matches/[id]/actions.ts']) {
    const source = read(rel);
    assert.match(source, /leaveMatch as leaveMatchInService/);
    assert.match(source, /leaveMatchInService\(matchId\)/);
    assert.doesNotMatch(source, /matchEntry\.deleteMany/);
  }
});

test('host roster never selects or renders a player email', () => {
  const source = read('src/app/player/posted/page.tsx');
  assert.doesNotMatch(source, /email:\s*true/);
  assert.doesNotMatch(source, /mailto:/);
});

test('auth and erasure audit details never carry an email', () => {
  const service = read('src/features/identity/service.ts');
  assert.doesNotMatch(service, /writeAudit\([^)]*email/);
  const settings = read('src/app/settings/actions.ts');
  assert.doesNotMatch(settings, /account_erased[\s\S]{0,120}email/);
  const account = read('src/features/identity/account.ts');
  assert.match(account, /auditLog\.updateMany/);
  assert.match(account, /detail:\s*\{\s*contains:\s*user\.email\s*\}/);
});
