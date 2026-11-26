import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const ROOT = new URL('../', import.meta.url);
export const CATALOG = new URL('../data/facebook-posts.json', import.meta.url);
export const CURATION = new URL('../data/facebook-curation.json', import.meta.url);

async function jsonOr(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

export async function readCatalog() {
  const doc = await jsonOr(CATALOG, { version: 1, updatedAt: null, items: [] });
  if (!Array.isArray(doc.items)) throw new Error('Invalid Facebook catalogue: items must be an array');
  return doc;
}

export async function readCuration() {
  return jsonOr(CURATION, { includeIds: [], excludeIds: [], categoryOverrides: {} });
}

const rules = [
  ['awards', /award|honou?r|felicitat|recognition|सम्मान|पुरस्कार|अवार्ड|सम्मानित|सम्मेलन/i],
  ['film-sets', /shoot|on.set|behind.the.scenes|film.?set|camera|director|direction|filmmak|shooting|production|cinema|filming|cinematograph|फ़िल्म|फिल्म|निर्देशक|शूटिंग|निर्देशन|सिनेमा/i],
  ['television', /television|serial|tv show|episode|broadcast|mah[aá]bharat|doordarshan|टीवी|टेलीविज़न|धारावाहिक|महाभारत/i],
  ['career', /career|film festival|bollywood|industry|b\.r\.? films|chopra|filmography|screenwriting|writer|script|premiere|प्रोडक्शन|लेखक|सफर|करियर/i],
  ['events', /event|ceremony|function|seminar|workshop|meeting|launch|festival|screening|कार्यक्रम|समारोह|मुलाकात/i]
];
export const categories = ['film-sets', 'television', 'awards', 'career', 'events'];

export function categoryFor(text, id, curation) {
  if (curation.excludeIds?.includes(id)) return null;
  const override = curation.categoryOverrides?.[id];
  if (categories.includes(override)) return override;
  for (const [category, pattern] of rules) if (pattern.test(text)) return category;
  return curation.includeIds?.includes(id) ? 'career' : null;
}

export function cleanText(value, limit = 6000) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim().slice(0, limit) : '';
}

export function facebookLink(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com') ||
       url.hostname === 'fb.com' || url.hostname.endsWith('.fb.com'))
      ? url.toString() : null;
  } catch { return null; }
}

export async function saveCatalogue(old, incoming) {
  const byId = new Map(old.items.map(item => [item.id, item]));
  for (const item of incoming) {
    if (!item?.id || !Array.isArray(item.images) || !item.images.length) continue;
    byId.set(item.id, item);
  }
  const items = [...byId.values()].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')) || a.id.localeCompare(b.id));
  // Avoid committing the same catalogue on every scheduled sync.
  if (JSON.stringify(items) === JSON.stringify(old.items)) {
    return { imported: incoming.length, total: items.length, changed: false };
  }
  const updatedAt = new Date().toISOString();
  const output = { version: 1, updatedAt, items };
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(CATALOG, JSON.stringify(output, null, 2) + '\n');
  return { imported: incoming.length, total: items.length };
}
