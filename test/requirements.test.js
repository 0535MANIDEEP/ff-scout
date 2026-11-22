const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const post = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'post', 'page.tsx'), 'utf8');
const detail = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'matches', '[id]', 'page.tsx'), 'utf8');
const schema = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');

test('the Requirements label reuses notes without a new column', () => {
  assert.match(post, /Requirements/);
  assert.match(post, /name="notes"/);
  assert.match(detail, /Requirements/);
  assert.doesNotMatch(schema, /requirements\s+String/);
});
