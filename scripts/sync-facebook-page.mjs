// Fetches Page-owned photographs only after an authorized Page token is supplied.
// No Meta secrets or temporary Facebook image URLs are written to the website.
import { createHash } from 'node:crypto';
import { readCatalog, readCuration, categoryFor, cleanText, facebookLink, saveCatalogue } from './facebook-core.mjs';

const pageId = process.env.FACEBOOK_PAGE_ID;
const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const graphVersion = process.env.FACEBOOK_GRAPH_VERSION || 'v27.0';
const maxPages = Number(process.env.FACEBOOK_MAX_PAGES || 30);
const maxUploads = Number(process.env.FACEBOOK_MAX_UPLOADS || 100);
if (!pageId || !pageToken) throw new Error('Provide FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN for an owned Facebook Page.');
if (!cloudName || !apiKey || !apiSecret) throw new Error('Provide Cloudinary credentials for durable photo storage.');
if (!/^v\d+\.\d+$/.test(graphVersion) || !/^\d+$/.test(pageId)) throw new Error('Invalid Page ID or Graph API version.');

async function graph(path, fields) {
  const result = [];
  let url = new URL(`https://graph.facebook.com/${graphVersion}/${pageId}/${path}`);
  url.searchParams.set('fields', fields);
  url.searchParams.set('limit', '100');
  url.searchParams.set('access_token', pageToken);
  for (let page = 0; url && page < maxPages; page++) {
    if (url.hostname !== 'graph.facebook.com' || url.protocol !== 'https:') throw new Error('Unexpected Graph pagination host');
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const body = await response.json();
    if (!response.ok || body.error) throw new Error(`Facebook ${path} request failed: ${body.error?.message || response.status}`);
    result.push(...(body.data || []));
    url = body.paging?.next ? new URL(body.paging.next) : null;
  }
  return result;
}

function attachmentsFor(post) {
  const found = [];
  const walk = (attachment) => {
    if (!attachment) return;
    const type = String(attachment.type || '');
    const link = attachment.media?.image?.src;
    if (link && /photo|album|cover|profile/i.test(type)) found.push(link);
    for (const nested of attachment.subattachments?.data || []) walk(nested);
  };
  for (const attachment of post.attachments?.data || []) walk(attachment);
  // A photo post can supply full_picture even without an attachments response.
  if (!found.length && post.type === 'photo' && post.full_picture) found.push(post.full_picture);
  return [...new Set(found)];
}

function ownedPhotoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com') ||
      url.hostname === 'fbcdn.net' || url.hostname.endsWith('.fbcdn.net') ||
      url.hostname === 'fbsbx.com' || url.hostname.endsWith('.fbsbx.com')
    );
  } catch { return false; }
}

async function uploadPhoto(url, id) {
  if (!ownedPhotoUrl(url)) throw new Error('Photo URL is not hosted by Meta');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Photo fetch failed (${response.status})`);
  const mime = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime)) throw new Error('Unsupported image format');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 15 * 1024 * 1024) throw new Error('Photo exceeds 15MB limit');
  const publicId = createHash('sha256').update(id).digest('hex').slice(0, 30);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'rameshsharma/facebook';
  const toSign = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), `${publicId}.jpg`);
  for (const [key, value] of Object.entries({ api_key: apiKey, timestamp, signature, folder, public_id: publicId, overwrite: 'true' })) {
    form.append(key, String(value));
  }
  const upload = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body: form });
  const body = await upload.json();
  if (!upload.ok || !body.secure_url) throw new Error(`Cloudinary upload failed: ${body.error?.message || upload.status}`);
  return body.secure_url;
}

const existing = await readCatalog();
const curation = await readCuration();
const prior = new Map(existing.items.map(item => [item.id, item]));
const posts = await graph('posts', 'id,message,created_time,permalink_url,is_published,type,full_picture,attachments{type,media,subattachments}');
const photos = await graph('photos', 'id,name,created_time,link,images');
const candidates = [
  ...posts.filter(post => post.is_published !== false).map(post => ({
    id: `page-post:${post.id}`, caption: cleanText(post.message),
    createdAt: post.created_time, sourceUrl: facebookLink(post.permalink_url),
    links: attachmentsFor(post)
  })),
  ...photos.map(photo => ({
    id: `page-photo:${photo.id}`, caption: cleanText(photo.name),
    createdAt: photo.created_time, sourceUrl: facebookLink(photo.link),
    links: photo.images?.[0]?.source ? [photo.images[0].source] : []
  }))
];
const changed = [];
let uploads = 0;
let failures = 0;
for (const candidate of candidates) {
  const category = categoryFor(candidate.caption, candidate.id, curation);
  if (!category || !candidate.links.length || !candidate.createdAt) continue;
  const before = prior.get(candidate.id);
  const images = [];
  for (const [i, link] of candidate.links.slice(0, 12).entries()) {
    const stable = before?.images?.[i]?.url;
    if (stable) { images.push({ url: stable, alt: candidate.caption.slice(0, 140) || 'Ramesh R Sharma career photograph' }); continue; }
    if (uploads >= maxUploads) break;
    try {
      const url = await uploadPhoto(link, `${candidate.id}:${i}`);
      images.push({ url, alt: candidate.caption.slice(0, 140) || 'Ramesh R Sharma career photograph' });
      uploads++;
    } catch (error) { failures++; console.error(`Could not import ${candidate.id} photo ${i}: ${error.message}`); }
  }
  if (!images.length) continue;
  changed.push({
    id: candidate.id, source: 'facebook-page', createdAt: candidate.createdAt,
    caption: candidate.caption, sourceUrl: candidate.sourceUrl, category, images
  });
}
const count = await saveCatalogue({ ...existing, items: existing.items.filter(item => !curation.excludeIds?.includes(item.id)) }, changed);
console.log(`Facebook Page import: ${posts.length} posts, ${photos.length} photos checked; ${count.imported} entries processed, ${uploads} images uploaded, ${count.total} catalogue entries, ${failures} photo failures.`);
if (failures) process.exitCode = 1;
