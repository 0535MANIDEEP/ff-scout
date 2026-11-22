const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Smoke tests run against a THROWAWAY Postgres (CI service container).
// Locally: DATABASE_URL must point at a scratch database — never at the
// dev/prod one. db push --force-reset drops and recreates the schema.
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  test('smoke suite requires DATABASE_URL (a scratch Postgres) to run', { skip: true }, () => {});
} else {
  test.before(() => {
    execSync('npx prisma db push --force-reset --skip-generate', {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    execSync('node prisma/seed.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
  });

  test('seeded database has players and a free entry match, with no seeded admin', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    const players = await prisma.user.findMany({ where: { userType: 'player' } });
    assert.ok(players.length >= 5, 'expected at least 5 seeded players');
    assert.ok(players.every(p => p.brRank && p.role), 'every seeded player must have a rank and role');
    assert.equal(await prisma.user.count({ where: { userType: 'admin' } }), 0, 'no seeded admin');
    const match = await prisma.match.findFirst({ where: { entry: 'free', prize: 'none' } });
    assert.ok(match, 'a free entry match is seeded');
    await prisma.$disconnect();
  });
}

test('package.json scripts include build/start/lint', () => {
  const pkg = require('../package.json');
  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts.start);
  assert.ok(pkg.scripts.lint);
});

test('project uses a recent Next major', () => {
  const pkg = require('../package.json');
  assert.match(String(pkg.dependencies.next), /^\^(1[56])/);
});
