import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveConfig } from 'vite';

test('production builds use the repository base path for GitHub Pages', async () => {
  const config = await resolveConfig({}, 'build', 'production');

  assert.equal(config.base, '/persona-lab/');
});
