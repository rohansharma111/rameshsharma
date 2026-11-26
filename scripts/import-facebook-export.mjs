// Safe bulk importer for an unzipped, owner-authorized Facebook JSON export.
// Preview is the default. --apply copies selected public-worthy media to the site.
// Never point this tool at a private export and commit its raw files.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, realpath, stat } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { readCatalog, readCuration, cleanText, categoryFor, facebookLink, saveCatalogue } from './facebook-core.mjs';

const args = process.argv.slice(2);
const exportDirectory = args.find(arg => !arg.startsWith('--'));
const apply = args.includes('--apply');
if (!exportDirectory) throw new Error('Usage: node scripts/import-facebook-export.mjs <unzipped-export-folder> [--apply]');
const root = await realpath(resolve(exportDirectory));
const curation = await readCuration();
const existing = await readCatalog();

async function scan(directory, depth = 0) {
  if (depth > 12) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await scan(path, depth + 1));
    else if (entry.isFile() && entry.name.endsWith('.json') &&
      /(^|[\\/])(posts|photos_and_videos|albums|your_posts)([\\/]|_)/i.test(path)) found.push(path);
  }
  return found;
}

function mediaUris(value, result = [], depth = 0) {
  if (!value || depth > 12) return result;
  if (Array.isArray(value)) {
    for (const item of value) mediaUris(item, result, depth + 1);
  } else if (typeof value === 'object') {
    if (typeof value.uri === 'string' && /\.(?:jpg|jpeg|png|webp|gif)$/i.test(value.uri)) result.push(value.uri);
    for (const [key, child] of Object.entries(value)) if (key !== 'uri') mediaUris(child, result, depth + 1);
  }
  return result;
}

function rowsFromJson(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value).flatMap(v => Array.isArray(v) ? v : []);
  return [];
}

function postCaption(row) {
  const fromData = Array.isArray(row.data)
    ? row.data.map(v => typeof v.post === 'string' ? v.post : '').filter(Boolean).join('\n')
    : '';
  return cleanText(fromData || row.description || row.message || row.caption || row.title || row.name);
}

function isoDate(row) {
  const stamp = row.timestamp || row.creation_timestamp || row.created_timestamp;
  if (typeof stamp === 'number') {
    const d = new Date(stamp * 1000);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof stamp === 'string') {
    const d = new Date(stamp);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function pathInside(base, item) {
  const rel = relative(base, item);
  return rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel);
}

const supported = new Map([
  ['.jpg', [0xff, 0xd8, 0xff]], ['.jpeg', [0xff, 0xd8, 0xff]],
  ['.png', [0x89, 0x50, 0x4e, 0x47]], ['.gif', [0x47, 0x49, 0x46, 0x38]]
]);
async function safeMedia(uri) {
  let decoded;
  try { decoded = decodeURIComponent(uri); } catch { return null; }
  if (decoded.includes('\\') || decoded.includes('\0') || /^[a-z]+:/i.test(decoded)) return null;
  const candidate = resolve(root, decoded);
  if (!pathInside(root, candidate)) return null;
  let location;
  try { location = await realpath(candidate); } catch { return null; }
  if (!pathInside(root, location)) return null;
  const extension = extname(location).toLowerCase();
  if (![...supported.keys(), '.webp'].includes(extension)) return null;
  const info = await stat(location);
  if (!info.isFile() || info.size > 15 * 1024 * 1024 || info.size < 12) return null;
  const content = await readFile(location);
  const magic = supported.get(extension);
  if (magic && !magic.every((v, i) => content[i] === v)) return null;
  if (extension === '.webp' && (content.toString('ascii', 0, 4) !== 'RIFF' || content.toString('ascii', 8, 12) !== 'WEBP')) return null;
  return { content, extension, original: location };
}

const jsonFiles = await scan(root);
const found = new Map();
let inspected = 0;
for (const file of jsonFiles) {
  let parsed;
  try { parsed = JSON.parse(await readFile(file, 'utf8')); }
  catch { console.warn(`Skipped invalid JSON file: ${relative(root, file)}`); continue; }
  for (const row of rowsFromJson(parsed)) {
    if (!row || typeof row !== 'object') continue;
    const uris = [...new Set(mediaUris(row))];
    if (!uris.length) continue;
    inspected++;
    const caption = postCaption(row);
    const createdAt = isoDate(row);
    const id = 'export:' + createHash('sha256')
      .update(JSON.stringify([relative(root, file), row.timestamp, uris[0]])).digest('hex').slice(0, 20);
    const category = categoryFor(caption, id, curation);
    if (!category) continue;
    const images = [];
    for (const uri of uris.slice(0, 12)) {
      const media = await safeMedia(uri);
      if (!media) continue;
      const digest = createHash('sha256').update(media.content).digest('hex').slice(0, 24);
      const dest = `assets/facebook/${digest}${media.extension}`;
      if (apply) {
        await mkdir(resolve('assets/facebook'), { recursive: true });
        await copyFile(media.original, resolve(dest));
      }
      images.push({ url: dest, alt: caption.slice(0, 140) || 'Ramesh R Sharma archive photograph' });
    }
    if (!images.length) continue;
    found.set(id, {
      id, source: 'facebook-export', createdAt, caption, sourceUrl:
        facebookLink(row.url || row.permalink_url || row.link),
      category, images
    });
  }
}
console.log(`Scanned ${jsonFiles.length} export JSON files and ${inspected} entries with media. ${found.size} relevant entries selected.`);
for (const entry of [...found.values()].slice(0, 15)) {
  console.log(`[${entry.category}] ${entry.createdAt || 'Date unknown'} | ${entry.images.length} photo(s) | ${entry.caption.slice(0, 90)} | ${entry.id}`);
}
if (!apply) {
  console.log('Preview only: no content changed. Review entries and run again with --apply to publish. Use data/facebook-curation.json for overrides.');
} else {
  const count = await saveCatalogue({ ...existing, items: existing.items.filter(item => !curation.excludeIds?.includes(item.id)) }, [...found.values()]);
  console.log(`Saved ${count.imported} imported entries (${count.total} total). Review changes before committing.`);
}
