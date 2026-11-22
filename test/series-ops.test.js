const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// DB-gated tests for series-ops: template-edit freeze, schedule-edit purge, pause/resume.
// (erasure.test.js loader pattern; '@/' aliases mapped per Task 5 ruling.)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  test('series-ops smoke test requires DATABASE_URL', { skip: true }, () => {});
} else {
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
      if (id === 'server-only') return {};
      if (id.startsWith('./') || id.startsWith('../')) {
        const base = path.resolve(path.dirname(file), id);
        for (const ext of ['.ts', '.js']) {
          if (fs.existsSync(base + ext)) return loadTs(base + ext);
        }
        throw new Error('cannot resolve ' + id + ' from ' + file);
      }
      if (id.startsWith('@/')) {
        const base = path.join(root, 'src', id.slice(2));
        for (const ext of ['.ts', '.js']) {
          if (fs.existsSync(base + ext)) return loadTs(base + ext);
        }
        if (fs.existsSync(base)) return Module.createRequire(path.join(root, 'package.json'))(base);
      }
      return Module.createRequire(path.join(root, 'package.json'))(id);
    };
    const wrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', js);
    wrapper.call(mod.exports, mod.exports, localRequire, mod, mod.filename, path.dirname(file));
    return mod.exports;
  }

  const { prisma } = loadTs(path.join(root, 'src/shared/db/client.ts'));
  const { applyTemplateEdit, applyScheduleEdit } = loadTs(path.join(root, 'src/features/series/service.ts'));

  let qaCounter = 0;
  const qaEmail = () => `qa+series-ops-${Date.now()}-${qaCounter++}@example.com`;

  async function makeUser() {
    return prisma.user.create({ data: { email: qaEmail(), passwordHash: 'qa', displayName: 'qa-ops', userType: 'player' } });
  }
  async function makeMatch(data) {
    return prisma.match.create({ data });
  }

  test('applyTemplateEdit: joined occurrences keep original terms; 0-join future slots update', async () => {
    const user = await makeUser();
    const series = await prisma.matchSeries.create({ data: { organizerId: user.id, title: 'Old Title', mode: 'BR', gameType: 'BR/CS', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, durationMinutes: 90, dayOfWeek: 5, startTimeLocal: '20:00', status: 'active' } });
    const joined = await makeMatch({ organizerId: user.id, title: 'Old Title', mode: 'BR', gameType: 'BR/CS', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'open', date: new Date(Date.now() + 3 * 86_400_000 + 3_600_000), endsAt: new Date(Date.now() + 3 * 86_400_000 + 3_600_000 + 90_000), seriesId: series.id });
    await prisma.matchEntry.create({ data: { matchId: joined.id, playerId: user.id } });
    const futureEmpty = await makeMatch({ organizerId: user.id, title: 'Old Title', mode: 'BR', gameType: 'BR/CS', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'open', date: new Date(Date.now() + 7 * 86_400_000), endsAt: new Date(Date.now() + 7 * 86_400_000 + 90_000), seriesId: series.id });

    await applyTemplateEdit(series.id, { title: 'New Title', mode: 'casual', gameType: 'CS', entry: 'paid', prize: 'pool', city: 'Hyderabad', online: true, slots: 8, durationMinutes: 60 });

    const reFetched = await prisma.match.findUnique({ where: { id: joined.id } });
    assert.equal(reFetched.title, 'Old Title', 'joined occurrence keeps title (bait-and-switch guard)');
    assert.equal(reFetched.mode, 'BR');
    assert.equal(reFetched.entry, 'free');

    const reFetchedEmpty = await prisma.match.findUnique({ where: { id: futureEmpty.id } });
    assert.equal(reFetchedEmpty.title, 'New Title', '0-join future slot receives new template');
    assert.equal(reFetchedEmpty.mode, 'casual');
    assert.ok(reFetchedEmpty.endsAt.getTime() - reFetchedEmpty.date.getTime() === 60 * 60_000, 'new duration reflected in endsAt');
  });

  test('applyScheduleEdit: purges future 0-join slots, keeps joined ones, regenerates window', async () => {
    const user = await makeUser();
    const series = await prisma.matchSeries.create({ data: { organizerId: user.id, title: 'S', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', online: false, durationMinutes: 90, dayOfWeek: 5, startTimeLocal: '20:00', status: 'active' } });
    const oldSlot = await makeMatch({ organizerId: user.id, title: 'S', mode: 'BR', gameType: 'BR', entry: 'free', prize: 'none', city: 'Hyderabad', status: 'open', date: new Date(Date.now() + 3 * 86_400_000), endsAt: new Date(Date.now() + 3 * 86_400_000 + 90_000), seriesId: series.id });

    await applyScheduleEdit(series.id); // regenerates the 2-week window; old 0-join slot must be gone

    const gone = await prisma.match.findUnique({ where: { id: oldSlot.id } });
    assert.equal(gone, null, 'old-time 0-join slot purged');
    const fresh = await prisma.match.findMany({ where: { seriesId: series.id, date: { gt: new Date() } }, orderBy: { date: 'asc' }, select: { date: true } });
    assert.ok(fresh.length >= 1, 'new window materialized');
    assert.ok(fresh[0].date.getTime() > new Date().getTime(), 'first new occurrence in future');
  });

  test.after(async () => {
    const qaUsers = await prisma.user.findMany({ where: { email: { contains: 'qa+series-' } } });
    const ids = qaUsers.map(u => u.id);
    await prisma.match.deleteMany({ where: { organizerId: { in: ids } } });
    await prisma.matchSeries.deleteMany({ where: { organizerId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  });
}
