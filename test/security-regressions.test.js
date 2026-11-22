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

test('rate limit check is atomic and still refuses closed on failure', () => {
  const source = read('src/shared/rate-limit.ts');
  assert.match(source, /prisma\.\$transaction/);
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /return \{ ok: false, retryAfterSeconds: 60 \}/);
});

test('error query params cannot reach inherited object keys', () => {
  for (const rel of ['src/app/matches/[id]/page.tsx', 'src/app/post/page.tsx']) {
    assert.match(read(rel), /Object\.prototype\.hasOwnProperty\.call\(ERRORS, /);
  }
});

test('structured data escapes script-breaking characters', () => {
  const source = read('src/app/layout.tsx');
  assert.match(source, /replace\(\/<\/g/);
  assert.match(source, /u003c/);
});

test('login throttling has a network dimension and unknown emails cost bcrypt', () => {
  const action = read('src/app/login/actions.ts');
  assert.match(action, /login-ip:\$\{ip\}/);
  assert.match(action, /login:\$\{emailRaw\}:\$\{ip\}/);
  const service = read('src/features/identity/service.ts');
  assert.match(service, /user\?\.passwordHash \?\? DUMMY_PASSWORD_HASH/);
});

test('signup does not disclose whether an email is registered', () => {
  const action = read('src/app/sign-up/actions.ts');
  assert.doesNotMatch(action, /already registered/);
  assert.match(action, /Missing or invalid fields\./);
});

test('sign-out rejects a foreign Origin', () => {
  assert.match(read('src/app/sign-out/route.ts'), /new URL\(origin\)\.host === host/);
  assert.match(read('src/app/sign-out/route.ts'), /status: 403/);
});

test('erasure scrubs user audit details before anonymizing', () => {
  assert.match(read('src/features/identity/account.ts'), /where: \{ userId \}, data: \{ detail: '\{\}' \}/);
});

test('password schemas cap bcrypt input at 72 bytes', () => {
  const schema = read('src/features/identity/schema.ts');
  assert.match(schema, /password: z\.string\(\)\.min\(1\)\.max\(72\)/);
  assert.match(schema, /password: z\.string\(\)\.min\(8\)\.max\(72\)/);
});

test('workflows pin actions and limit token permissions', () => {
  for (const rel of ['.github/workflows/ci.yml', '.github/workflows/cd.yml']) {
    const source = read(rel);
    assert.match(source, /permissions:\r?\n  contents: read/);
    assert.doesNotMatch(source, /uses: actions\/(checkout|setup-node)@v4/);
    assert.match(source, /uses: actions\/checkout@[0-9a-f]{40}/);
    assert.match(source, /uses: actions\/setup-node@[0-9a-f]{40}/);
  }
});

test('HSTS requests preload', () => {
  assert.match(read('next.config.mjs'), /includeSubDomains; preload/);
});
