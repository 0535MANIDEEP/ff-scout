const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src');
const sourceFiles = fs.readdirSync(root, { recursive: true })
  .filter((name) => /\.(ts|tsx)$/.test(name))
  .map((name) => path.join(root, name));

test('the contact control shows Contact now and keeps a mailto target', () => {
  const control = fs.readFileSync(path.join(root, 'shared', 'ui', 'ContactNow.tsx'), 'utf8');
  assert.match(control, /Contact now/);
  assert.match(control, /mailto:\$\{BRAND\.email\}/);
});

test('no page renders the address as text or builds its own mailto link', () => {
  for (const file of sourceFiles) {
    if (file.endsWith(path.join('shared', 'ui', 'ContactNow.tsx'))) continue;
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\{BRAND\.email\}\s*<\/a>/, `visible address in ${path.relative(root, file)}`);
    assert.doesNotMatch(source, /mailto:\$\{BRAND\.email\}/, `inline mailto in ${path.relative(root, file)}`);
  }
});
