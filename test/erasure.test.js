const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// DPDP erasure cascade, exercised against the throwaway test database.
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  test('erasure smoke test requires DATABASE_URL (a scratch Postgres)', { skip: true }, () => {});
} else {
  const { execSync } = require('node:child_process');

  function loadTs(rel) {
    const file = path.join(__dirname, '..', rel);
    const src = fs.readFileSync(file, 'utf8');
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const mod = new Module(file + '.js');
    mod.filename = file + '.js';
    mod.paths = Module._nodeModulePaths(path.join(__dirname, '..'));
    mod._compile(js, mod.filename);
    return mod.exports;
  }

  test.before(() => {
    execSync('npx prisma db push --force-reset --skip-generate', {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
  });

  test('eraseAccount removes the user, proofs and rate-limit rows; admin survives', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    const { eraseAccount } = loadTs('src/lib/account.ts');

    const admin = await prisma.user.create({
      data: { email: 'admin@example.test', passwordHash: 'x', displayName: 'AdminForEraseTest', userType: 'admin' },
    });
    const victim = await prisma.user.create({
      data: {
        email: 'victim@example.test',
        passwordHash: 'x',
        displayName: 'EraseMe',
        userType: 'player',
        role: 'fragger',
        rank: 'Gold',
      },
    });
    await prisma.verificationProof.create({
      data: { userId: victim.id, fileData: 'data:image/png;base64,AAAA', fileName: 'x.png', mimeType: 'image/png' },
    });
    await prisma.rateLimitEntry.create({ data: { key: 'login:victim@example.test' } });
    await prisma.auditLog.create({ data: { userId: victim.id, action: 'login', detail: '{"email":"victim@example.test"}' } });

    await eraseAccount(victim.id);

    assert.equal(await prisma.user.count({ where: { email: 'victim@example.test' } }), 0, 'user gone');
    assert.equal(await prisma.verificationProof.count({ where: { userId: victim.id } }), 0, 'proofs gone');
    assert.equal(await prisma.rateLimitEntry.count({ where: { key: { contains: 'victim@example.test' } } }), 0, 'rate-limit rows gone');
    assert.equal(await prisma.auditLog.count({ where: { userId: victim.id } }), 0, 'audit user refs nulled');
    assert.equal(await prisma.user.findUnique({ where: { id: admin.id } }).then((u) => !!u), true, 'admin untouched');
    await prisma.$disconnect();
  });
}
