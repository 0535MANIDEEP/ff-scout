const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadAppearance() {
  const file = path.join(__dirname, '../src/lib/appearance.ts');
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = new Module(file);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.join(__dirname, '..'));
  mod._compile(js, file);
  return mod.exports;
}

test('uses the system dark preference when no appearance is stored', () => {
  const appearance = loadAppearance();
  assert.ok(appearance, 'src/lib/appearance.ts should exist');

  const result = appearance.parseStoredAppearance(null, null, true);

  assert.deepEqual(result, {
    preset: 'night',
    accent: null,
    density: 'regular',
    motion: 'system',
  });
});

test('migrates the legacy dark theme to the night preset', () => {
  const appearance = loadAppearance();

  const result = appearance.parseStoredAppearance(null, 'dark', false);

  assert.equal(result.preset, 'night');
});

test('reads a valid stored appearance', () => {
  const appearance = loadAppearance();
  const raw = JSON.stringify({
    preset: 'sand',
    accent: '#B4471F',
    density: 'compact',
    motion: 'reduced',
  });

  const result = appearance.parseStoredAppearance(raw, null, false);

  assert.deepEqual(result, {
    preset: 'sand',
    accent: '#b4471f',
    density: 'compact',
    motion: 'reduced',
  });
});

test('rejects invalid stored values and keeps the last valid accent', () => {
  const appearance = loadAppearance();
  const raw = JSON.stringify({
    preset: 'night',
    accent: '#111111',
    density: 'huge',
    motion: 'cinematic',
  });

  const result = appearance.parseStoredAppearance(raw, null, false);

  assert.deepEqual(result, {
    preset: 'night',
    accent: null,
    density: 'regular',
    motion: 'system',
  });
});

test('computes WCAG contrast and rejects low-contrast accents', () => {
  const appearance = loadAppearance();

  assert.equal(appearance.contrastRatio('#ffffff', '#000000'), 21);
  assert.equal(appearance.isAccessibleAccent('#b4471f', '#F6EFE2'), true);
  assert.equal(appearance.isAccessibleAccent('#111111', '#141311'), false);
});

test('initializes the document from stored appearance before paint', () => {
  const appearance = loadAppearance();
  const vm = require('node:vm');
  const values = {
    'fc-appearance': JSON.stringify({ preset: 'slate', density: 'compact', motion: 'reduced' }),
  };
  const root = { dataset: {}, style: { setProperty() {} } };
  const sandbox = {
    localStorage: { getItem(key) { return values[key] ?? null; } },
    window: { matchMedia: () => ({ matches: false }) },
    document: { documentElement: root },
  };

  vm.runInNewContext(appearance.appearanceInitScript(), sandbox);

  assert.equal(root.dataset.preset, 'slate');
  assert.equal(root.dataset.density, 'compact');
  assert.equal(root.dataset.motion, 'reduced');
  assert.equal(root.dataset.theme, 'dark');
});

test('applies appearance tokens to the root element', () => {
  const appearance = loadAppearance();
  const properties = new Map();
  const root = {
    dataset: {},
    style: {
      setProperty(name, value) { properties.set(name, value); },
      removeProperty(name) { properties.delete(name); },
    },
  };

  appearance.applyAppearance(root, {
    preset: 'night',
    accent: '#ff6f5e',
    density: 'compact',
    motion: 'reduced',
  });

  assert.equal(root.dataset.preset, 'night');
  assert.equal(root.dataset.density, 'compact');
  assert.equal(root.dataset.motion, 'reduced');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(properties.get('--accent'), '#ff6f5e');
  assert.ok(properties.has('--accent-2'));
  assert.equal(properties.get('--on-accent'), '#141311');
});
