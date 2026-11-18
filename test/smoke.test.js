const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const dbPath = path.join(__dirname, 'test.db');

function pushAndSeed() {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  // Push schema to this throwaway database, then seed it.
  execSync('npx prisma db push --force-reset', {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
  execSync('node prisma/seed.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}

test.before(() => pushAndSeed());

test.after(() => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

test('seeded database has players and at least one admin', async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const players = await prisma.user.findMany({ where: { userType: 'player' } });
  assert.ok(players.length >= 5, 'expected at least 5 seeded players');
  assert.ok(players.every(p => p.rank && p.role), 'every seeded player must have rank and role');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@ffscout.dev' } });
  assert.ok(admin, 'admin seeded');
  assert.equal(admin.userType, 'admin');
  await prisma.$disconnect();
});

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
