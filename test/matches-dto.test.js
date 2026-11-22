const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const service = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'matches', 'service.ts'), 'utf8');
const repository = fs.readFileSync(path.join(__dirname, '..', 'src', 'features', 'matches', 'repository.ts'), 'utf8');

test('public match DTO has no money field', () => {
  const dto = service.slice(service.indexOf('export function matchDTO'), service.indexOf('export async function createMatch'));
  for (const gone of ['entryFee', 'prizePool', 'paidUntil', 'visibleToSponsors']) {
    assert.ok(!dto.includes(gone), `DTO exposes ${gone}`);
  }
});

test('legacy rows with non-null money values cannot reach the board', () => {
  assert.match(repository, /select:\s*\{/);
  assert.doesNotMatch(repository, /select:\s*\{\s*\*/);
});
