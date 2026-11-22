const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'globals.css'), 'utf8');
const pkg = require('../package.json');

test('Tailwind v4 is installed and imported', () => {
  assert.ok(pkg.dependencies.tailwindcss.startsWith('^4'));
  assert.ok(pkg.devDependencies['@tailwindcss/postcss'] || pkg.dependencies['@tailwindcss/postcss']);
  assert.match(css, /@import "tailwindcss"/);
  assert.match(css, /@theme/);
});

test('the disclosure text lives in one module', () => {
  const files = fs.readdirSync(path.join(__dirname, '..', 'src', 'features', 'disclosure'));
  assert.ok(files.includes('copy.ts'));
});
