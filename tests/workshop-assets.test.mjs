import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
const root = new URL('../public/workshop/', import.meta.url);
test('prepared copy points to bundled assets and preserves disclosures', async () => {
  const data = JSON.parse(await readFile(new URL('content.json', root), 'utf8'));
  assert.equal(data.team[0].character, 'Female fox');
  assert.equal(data.customers.length, 4);
  assert.match(data.testimonialDisclosure, /Fictional/);
  assert.match(data.disclosure, /not validated human research/);
  const paths = [data.brand.logo, ...data.team.map(x=>x.image), ...data.customers.flatMap(x=>[x.logo,x.image]), ...data.supporters.map(x=>x.logo), ...data.extraCharacters.map(x=>`characters/${x}.png`)];
  await Promise.all(paths.map(p=>access(new URL(p, root))));
  for(const page of ['landing','workspace','results']) await access(new URL(`mock/${page}.png`,root));
});
test('guide uses prepared assets instead of asking for new portrait generation', async () => {
  const guide = await readFile(new URL('../WORKSHOP-GUIDE.md', import.meta.url),'utf8');
  assert.match(guide, /public\/workshop\/content.json/);
  assert.doesNotMatch(guide, /DiceBear/);
  assert.match(guide, /Workspace and Results tasks yourself/);
  const project = guide.indexOf('## A — Set up and see the paper mock');
  const codexProject = guide.indexOf('### Add your Codex project');
  const preview = guide.indexOf('### See the paper mock');
  const deployment = guide.indexOf('## B — Publish with GitHub Pages');
  const modernization = guide.indexOf('## C — Modernize the landing page');
  assert.ok(project >= 0 && project < codexProject && codexProject < preview && preview < deployment && deployment < modernization);
  const taskTwo = guide.split('## C — Modernize the landing page')[1].split('## D — Personalize the company')[0];
  assert.match(taskTwo, /preserve its placeholders/i);
  assert.match(taskTwo, /Do not add the prepared Persona Lab logo/);
  assert.match(taskTwo, /Show me a browser-/);
  assert.match(taskTwo, /Annotate one element/);
  assert.doesNotMatch(guide, /<ISSUE_URL>/);
  assert.match(guide, /Work on the issue you just created above in this Codex task/);
  assert.doesNotMatch(guide, /^## (?:Step|Task) \d/m);
});
test('the landing page preserves workshop placeholders and links into the paper journey', async () => {
  const entry = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const paper = await readFile(new URL('mock/index.html', root), 'utf8');
  for (const placeholder of [
    'TAGLINE_GOES_HERE',
    'CLIENT_PLACEHOLDER_01',
    'TEAM_MEMBER_PLACEHOLDER_01',
    'SUPPORTER_PLACEHOLDER_01',
    'COMPANY_INFO_GOES_HERE',
  ]) assert.match(entry, new RegExp(placeholder));
  assert.match(entry, /Simulated-persona hypotheses, not validated human research/);
  assert.match(entry, /workshop\/mock\/index\.html#workspace/);
  assert.match(entry, /workshop\/mock\/index\.html#results/);
  for (const page of ['landing', 'workspace', 'results']) {
    assert.match(paper, new RegExp(`href="#${page}"`));
    assert.match(paper, new RegExp(`${page}\\.png`));
  }
});
