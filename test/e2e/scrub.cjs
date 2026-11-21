// Scheduled-matches E2E DB helper. Mirrors the repo's run-unique QA-email + scrub patterns.
// Usage: node test/e2e/scrub.cjs --setup ORG_EMAIL --helpers a@x.com,b@x.com
//        node test/e2e/scrub.cjs --dead-occurrences ORG_EMAIL
//        node test/e2e/scrub.cjs --assert-autopause ORG_EMAIL
//        node test/e2e/scrub.cjs --assert-series ORG_EMAIL active
//        node test/e2e/scrub.cjs --resume ORG_EMAIL
//        node test/e2e/scrub.cjs --scrub ORG_EMAIL --helpers a@x.com,b@x.com
// DATABASE_URL comes from the environment or .env.local.
const path = require('node:path');
const fs = require('node:fs');

const root = path.join(__dirname, '..', '..');
function loadUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const f = path.join(root, '.env.local');
  if (fs.existsSync(f)) {
    const m = fs.readFileSync(f, 'utf8').match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?\s*$/m);
    if (m) return m[1];
  }
  throw new Error('DATABASE_URL not set and no .env.local');
}

async function main() {
  const [, , cmd, ...args] = process.argv;
  if (!cmd) throw new Error('no command');
  const { PrismaClient } = require(path.join(root, 'node_modules', '@prisma', 'client'));
  const prisma = new PrismaClient({ datasources: { db: { url: loadUrl() } } });
  const nextEmail = (flag) => args[args.indexOf(flag) + 1];

  if (cmd === '--dump') {
    const orgEmail = args[args.indexOf('--dump') + 1];
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } });
    if (!org) { console.log('org not found'); return; }
    const series = await prisma.matchSeries.findMany({ where: { organizerId: org.id }, select: { id: true, title: true, status: true, dayOfWeek: true, startTimeLocal: true } });
    console.log('series:', JSON.stringify(series));
    const ms = await prisma.match.findMany({ where: { organizerId: org.id }, select: { id: true, title: true, date: true, status: true } });
    console.log('matches:', JSON.stringify(ms));
    return;
  }

  if (cmd === '--latest-e2e-email') {
    const u = await prisma.$queryRawUnsafe('SELECT "email" FROM "User" WHERE "displayName" = ' + "'qa-series-org'" + ' ORDER BY "createdAt" DESC LIMIT 1');
    console.log(u[0] ? u[0].email : '');
    return;
  }

  if (cmd === '--setup') {
    const { hashSync } = require(path.join(root, 'node_modules', 'bcryptjs'));
    const password = 'ffTestPass123';
    const orgEmail = args[args.indexOf('--setup') + 1];
    const helpers = args[args.indexOf('--helpers') + 1].split(',');
    const now = new Date();
    // Idempotent: update existing QA rows (re-runs after partial failures) then create missing ones.
    await prisma.user.updateMany({ where: { email: orgEmail }, data: { passwordHash: hashSync(password, 10) } });
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } })
      ?? await prisma.user.create({ data: { email: orgEmail, passwordHash: hashSync(password, 10), displayName: 'qa-series-org', userType: 'player' } });
    const createdHelpers = [];
    for (const h of helpers) {
      await prisma.user.updateMany({ where: { email: h }, data: { passwordHash: hashSync(password, 10) } });
      const u = await prisma.user.findUnique({ where: { email: h }, select: { id: true } })
        ?? await prisma.user.create({ data: { email: h, passwordHash: hashSync(password, 10), displayName: 'qa-helper', userType: 'player' } });
      createdHelpers.push({ id: u.id });
    }
    // 3 qualifying matches: endsAt past, closed, 2 distinct non-host joiners each.
    for (let i = 0; i < 3; i++) {
      const m = await prisma.match.create({
        data: {
          organizerId: org.id, title: `Qualify ${i}`, mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none',
          status: 'closed', date: new Date(now.getTime() - (3 + i) * 3_600_000),
          endsAt: new Date(now.getTime() - (3 + i) * 3_600_000 + 5), city: 'Hyderabad',
        },
      });
      for (const h of createdHelpers) {
        await prisma.matchEntry.create({ data: { matchId: m.id, playerId: h.id } });
      }
    }
    console.log(JSON.stringify({ org: org.id, matches: 3 }));
    return;
  }

  if (cmd === '--dead-occurrences') {
    const orgEmail = args[args.indexOf('--dead-occurrences') + 1];
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } });
    if (!org) throw new Error('org not found: ' + orgEmail);
    const series = await prisma.matchSeries.findFirst({ where: { organizerId: org.id }, orderBy: { createdAt: 'desc' } });
    if (!series) throw new Error('no series found');
    // E2E: backdate series.createdAt so the two dead occurrences fall inside the TP3 window
    // (windowStart = COALESCE(resumedAt, createdAt)); unit tests cover the resume-window edge.
    await prisma.matchSeries.update({ where: { id: series.id }, data: { createdAt: new Date(Date.now() - 30 * 86400_000), lastGeneratedAt: null } });
    const now = new Date();
    // Two finished 0-join occurrences: endsAt in the past, date >= windowStart.
    for (let i = 0; i < 2; i++) {
      const d = new Date(now.getTime() - (i + 1) * 2 * 3_600_000);
      await prisma.match.create({
        data: {
          organizerId: org.id, title: `Dead ${i}`, mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad',
          status: 'closed', seriesId: series.id, date: d, endsAt: new Date(d.getTime() + 5),
        },
      });
    }
    console.log(JSON.stringify({ series: series.id }));
    return;
  }

  if (cmd === '--assert-autopause') {
    const orgEmail = args[args.indexOf('--assert-autopause') + 1];
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } });
    const series = await prisma.matchSeries.findFirst({ where: { organizerId: org.id }, orderBy: { createdAt: 'desc' } });
    console.log(series ? series.status : 'missing');
    return;
  }

  if (cmd === '--assert-series') {
    const orgEmail = args[args.indexOf('--assert-series') + 1];
    const want = args[args.indexOf('--assert-series') + 2];
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } });
    const series = await prisma.matchSeries.findFirst({ where: { organizerId: org.id }, orderBy: { createdAt: 'desc' } });
    console.log(series ? series.status : 'missing');
    return;
  }

  if (cmd === '--resume') {
    const orgEmail = args[args.indexOf('--resume') + 1];
    const org = await prisma.user.findUnique({ where: { email: orgEmail }, select: { id: true } });
    const series = await prisma.matchSeries.findFirst({ where: { organizerId: org.id }, orderBy: { createdAt: 'desc' } });
    if (!series) throw new Error('no series');
    await prisma.matchSeries.update({ where: { id: series.id }, data: { status: 'active', resumedAt: new Date() } });
    console.log(JSON.stringify({ series: series.id }));
    return;
  }

  if (cmd === '--scrub') {
    const ids = (await prisma.user.findMany({ where: { email: { contains: 'qa+series-e2e-' } } })).map(u => u.id);
    await prisma.match.deleteMany({ where: { organizerId: { in: ids } } }); // cascades entries
    await prisma.matchSeries.deleteMany({ where: { organizerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    console.log(`scrubbed ${ids.length} users`);
    return;
  }

  throw new Error('unknown command: ' + cmd);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('ERR:', e.message);
    process.exit(1);
  });
