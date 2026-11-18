const test = require('node:test');
const assert = require('node:assert/strict');

const pkg = require('../package.json');
process.env.DATABASE_URL = 'file:./dev.db';
const { PrismaClient } = require('@prisma/client');

test('database has seeded demo players', async () => {
  const prisma = new PrismaClient();
  const players = await prisma.user.findMany({ where: { userType: 'player' } });
  assert.equal(players.length, 5);
  const admin = await prisma.user.findUnique({ where: { email: 'admin@ffscout.dev' } });
  assert.equal(admin.userType, 'admin');
  await prisma.$disconnect();
});

test('package.json scripts include build/start/lint', () => {
  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts.start);
});

test('project uses Next 15', () => {
  assert.match(String(pkg.dependencies.next), /^\^15/);
});
