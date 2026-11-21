const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// DB-gated tests (erasure.test.js pattern) for MatchSeries eligibility + helpers.
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  test('series smoke test requires DATABASE_URL (a scratch Postgres)', { skip: true }, () => {});
} else {
  const { execSync } = require('node:child_process');

  const root = path.join(__dirname, '..');
  const cache = new Map();
  function loadTs(file) {
    file = path.normalize(file);
    if (cache.has(file)) return cache.get(file).exports;
    const src = fs.readFileSync(file, 'utf8');
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const mod = new Module(file);
    cache.set(file, mod);
    mod.exports = {};
    const localRequire = (id) => {
      if (id.startsWith('./') || id.startsWith('../')) {
        const base = path.resolve(path.dirname(file), id);
        for (const ext of ['.ts', '.js']) {
          if (fs.existsSync(base + ext)) return loadTs(base + ext);
        }
        throw new Error('cannot resolve ' + id + ' from ' + file);
      }
      // Ruling: erasure loader can't resolve tsconfig aliases; map '@/*' → './src/*'.
      return Module.createRequire(path.join(root, 'package.json'))(id.replace(/^@\//, path.join(root, 'src') + '/'));
    };
    const wrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', js);
    wrapper.call(mod.exports, mod.exports, localRequire, mod, mod.filename, path.dirname(file));
    return mod.exports;
  }

  const { prisma } = loadTs(path.join(root, 'src/lib/db.ts'));
  const { seriesEligibility, materializeSeries, autoPauseCheck, countQualifyingMatches } = loadTs(path.join(root, 'src/lib/series.ts'));
  const { istDayOfWeek } = loadTs(path.join(root, 'src/lib/schedule.ts'));

  let qaCounter = 0;
  const qaEmail = () => `qa+series-${Date.now()}-${qaCounter++}@example.com`;

  async function makeUser() {
    return prisma.user.create({ data: { email: qaEmail(), passwordHash: 'qa', displayName: 'qa-series', userType: 'player' } });
  }
  async function makeMatch(data) {
    return prisma.match.create({ data });
  }

  test('eligibility starts locked for a fresh organizer; unlocks with 3 qualifying matches and 2 non-host joins', async () => {
    const user = await makeUser();
    const helperA = await makeUser();
    const helperB = await makeUser();
    const e0 = await seriesEligibility(user.id);
    assert.equal(e0.unlocked, false);
    assert.equal(e0.qualified, 0);
    assert.equal(e0.needed, 3);

    // Two qualifying matches (closed status — status-independent).
    const m1 = await makeMatch({ organizerId: user.id, title: 'q1', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'closed', date: new Date(Date.now() - 4 * 3_600_000), endsAt: new Date(Date.now() - 4 * 3_600_000 + 5) });
    await prisma.matchEntry.createMany({ data: [{ matchId: m1.id, playerId: helperA.id }, { matchId: m1.id, playerId: helperB.id }] });
    // Third qualifying match.
    const m3 = await makeMatch({ organizerId: user.id, title: 'q3', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'open', date: new Date(Date.now() - 2 * 3_600_000), endsAt: new Date(Date.now() - 2 * 3_600_000 + 5) });
    await prisma.matchEntry.createMany({ data: [{ matchId: m3.id, playerId: helperA.id }, { matchId: m3.id, playerId: helperB.id }, { matchId: m3.id, playerId: user.id }] }); // host join is excluded

    // Third qualifying match.
    const m2 = await makeMatch({ organizerId: user.id, title: 'q2', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'closed', date: new Date(Date.now() - 3_600_000), endsAt: new Date(Date.now() - 3_600_000 + 5) });
    await prisma.matchEntry.createMany({ data: [{ matchId: m2.id, playerId: helperA.id }, { matchId: m2.id, playerId: helperB.id }] });

    const q = await countQualifyingMatches(user.id);
    assert.equal(q, 3, '3 matches qualify: 2+2 non-host joiners, closed counts, host excluded');
    const e2 = await seriesEligibility(user.id);
    assert.equal(e2.qualified, 3);
    assert.equal(e2.unlocked, true, 'activeSeries 0 < cap 2');
  });

  test('cap: with 2 active series the organizer is locked again', async () => {
    const user = await makeUser();
    await prisma.matchSeries.createMany({ data: [1, 2].map(i => ({ organizerId: user.id, title: `S${i}`, mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, durationMinutes: 90, dayOfWeek: 6, startTimeLocal: '20:00', status: 'active' })) });
    const e = await seriesEligibility(user.id);
    assert.equal(e.activeSeries, 2);
    assert.equal(e.unlocked, false, 'activeSeries >= cap blocks creation');
  });

  test('materializeSeries: idempotent materialization within lookaheadWeeks (skipDuplicates)', async () => {
    const user = await makeUser();
    const now = new Date();
    const series = await prisma.matchSeries.create({
      data: { organizerId: user.id, title: 'T', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, slots: 4, durationMinutes: 90, dayOfWeek: istDayOfWeek(now), startTimeLocal: '20:00', status: 'active' },
    });
    const n1 = await materializeSeries(series.id);
    const n2 = await materializeSeries(series.id);
    const rows = await prisma.match.findMany({ where: { seriesId: series.id } });
    assert.equal(n1, 2, 'lookaheadWeeks=2 occurrences materialized');
    assert.equal(n2, 2, 'second run generates again, but nothing duplicates');
    assert.equal(rows.length, 2, 'duplicates skipped on @@unique([seriesId, date])');
    for (const r of rows) {
      assert.equal(r.status, 'open');
      assert.ok(r.date.getTime() > now.getTime(), 'future occurrence');
      assert.ok(r.endsAt.getTime() - r.date.getTime() === 90 * 60_000, 'endsAt = date + 90 min');
      assert.equal(r.title, 'T');
    }
    const s = await prisma.matchSeries.findUnique({ where: { id: series.id } });
    assert.ok(s.lastGeneratedAt, 'lastGeneratedAt stamped');
  });

  test('autoPauseCheck: pauses when 2 latest finished occurrences have 0 joins; window = COALESCE(resumedAt, createdAt)', async () => {
    const user = await makeUser();
    const now = new Date();
    const series = await prisma.matchSeries.create({
      data: { organizerId: user.id, title: 'T', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, durationMinutes: 90, dayOfWeek: istDayOfWeek(now), startTimeLocal: '20:00', status: 'active', createdAt: new Date(Date.now() - 10 * 86_400_000) }, // TP3: window covers recent dead matches
    });
    await makeMatch({ organizerId: user.id, title: 'T', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'closed', date: new Date(now.getTime() - 3 * 3_600_000), endsAt: new Date(now.getTime() - 3 * 3_600_000 + 5), seriesId: series.id });
    await makeMatch({ organizerId: user.id, title: 'T', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'closed', date: new Date(now.getTime() - 2 * 3_600_000), endsAt: new Date(now.getTime() - 2 * 3_600_000 + 5), seriesId: series.id });

    const paused = await autoPauseCheck(series);
    assert.equal(paused, true, '2 finished, 0 joins → paused');
    const s1 = await prisma.matchSeries.findUnique({ where: { id: series.id } });
    assert.equal(s1.status, 'paused');
    const audit = await prisma.auditLog.findFirst({ where: { userId: user.id, action: 'series:auto_pause' } });
    assert.ok(audit, 'series:auto_pause audited');

    // Resumed: resumedAt = now → the 2 dead occurrences are before the window → not paused.
    const series2 = await prisma.matchSeries.create({
      data: { organizerId: user.id, title: 'T2', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, durationMinutes: 90, dayOfWeek: istDayOfWeek(now), startTimeLocal: '20:00', status: 'paused', createdAt: new Date(Date.now() - 10 * 86_400_000), resumedAt: now }, // TP3: window restarts at resume — old dead matches don't count
    });
    const paused2 = await autoPauseCheck(series2);
    assert.equal(paused2, false, 'resumedAt window excludes old dead occurrences');
  });

  test.after(async () => {
    // QA scrub: delete this file's QA rows (via the qa+series- emails).
    const qaUsers = await prisma.user.findMany({ where: { email: { contains: 'qa+series-' } } });
    const ids = qaUsers.map(u => u.id);
    await prisma.match.deleteMany({ where: { organizerId: { in: ids } } }); // cascades entries
    await prisma.matchSeries.deleteMany({ where: { organizerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  });
}
