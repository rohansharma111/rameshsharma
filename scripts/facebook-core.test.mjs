import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryFor, cleanText, facebookLink } from './facebook-core.mjs';

const empty = { includeIds: [], excludeIds: [], categoryOverrides: {} };
test('film and television posts are classified', () => {
  assert.equal(categoryFor('Behind the scenes shooting on a movie set', 'p1', empty), 'film-sets');
  assert.equal(categoryFor('Television serial Mahabharat memories', 'p2', empty), 'television');
  assert.equal(categoryFor('Received an award for direction', 'p3', empty), 'awards');
});
test('irrelevant and excluded posts are not published', () => {
  assert.equal(categoryFor('Happy weekend!', 'p1', empty), null);
  assert.equal(categoryFor('Film shooting', 'p2', { ...empty, excludeIds: ['p2'] }), null);
});
test('approved uncaptioned photos and category overrides work', () => {
  assert.equal(categoryFor('', 'p1', { ...empty, includeIds: ['p1'] }), 'career');
  assert.equal(categoryFor('Film shoot', 'p2', { ...empty, categoryOverrides: { p2: 'events' } }), 'events');
});
test('unsafe social links are rejected and captions remain literal', () => {
  assert.equal(facebookLink('javascript:alert(1)'), null);
  assert.equal(facebookLink('https://evil.example/?next=facebook.com'), null);
  assert.ok(facebookLink('https://www.facebook.com/directoramesharma/'));
  assert.equal(cleanText('<script>test</script>'), '<script>test</script>');
});
