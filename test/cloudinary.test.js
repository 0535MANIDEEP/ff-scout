const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Load the real TS source by transpiling on the fly (no extra deps).
const src = fs.readFileSync(path.join(__dirname, '../src/lib/cloudinary.ts'), 'utf8');
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = new Module(path.join(__dirname, '../src/lib/cloudinary.js'));
mod.filename = path.join(__dirname, '../src/lib/cloudinary.js');
mod.paths = Module._nodeModulePaths(path.join(__dirname, '..'));
mod._compile(js, mod.filename);
const { signParams, isCloudinaryConfigured } = mod.exports;

test('signParams matches manual sha1 of sorted params + secret', () => {
  const secret = 'test-secret-123';
  const params = { folder: 'ff-scout/proofs', overwrite: 'false', public_id: 'proof-1-abc', timestamp: '1700000000' };
  const expected = crypto
    .createHash('sha1')
    .update('folder=ff-scout/proofs&overwrite=false&public_id=proof-1-abc&timestamp=1700000000' + secret)
    .digest('hex');
  assert.equal(signParams(params, secret), expected);
});

test('signParams is deterministic and key-order independent', () => {
  const a = signParams({ b: '2', a: '1' }, 's');
  const b = signParams({ a: '1', b: '2' }, 's');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{40}$/);
});

test('isCloudinaryConfigured is false without env vars', () => {
  const saved = { ...process.env };
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
  assert.equal(isCloudinaryConfigured(), false);
  process.env = saved;
});
