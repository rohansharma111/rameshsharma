# Facebook photographs and captions — Ramesh R Sharma

This integration is implemented for the static [portfolio](https://rameshsharma.vercel.app/behind-the-frame.html). It does **not** scrape Facebook or require any paid third-party software. It must not be represented as already connected: no authorized Facebook data has been provided.

## Account type: not yet verified

The supplied vanity link `https://www.facebook.com/directoramesharma/` could identify either a Page or a personal account. Existing code called the numeric-ID link a personal profile; that was not independently verified. Do not assume a Page API token will work.

- **Real Facebook Page:** An administrator can use a Meta app with appropriate access and an authorized Page access token. Read the official [Page reference](https://developers.facebook.com/docs/graph-api/reference/page/), [Page posts](https://developers.facebook.com/docs/graph-api/reference/page/published_posts/) and [Page photos](https://developers.facebook.com/docs/graph-api/reference/page/photos/). Depending on app configuration/access level, `pages_show_list`, `pages_read_engagement`, `pages_read_user_content` and app review may be required.
- **Personal profile/professional-mode profile:** Page APIs cannot be assumed to work. Request the owner's archive via Meta Accounts Center > Your information and permissions > Export your information. Choose posts/photos, JSON, all time, high media quality. Unzip locally. It may not contain everything (including post links, edits, or deleted photos).

## What is actually built

- `scripts/import-facebook-export.mjs`: preview-first importer for owner-authorized, unzipped JSON exports. Recognizes common posts/album JSON shapes, resolves local image associations, validates paths and image signatures, deduplicates identical images by content digest and copies only selected images to `assets/facebook/`.
- `scripts/sync-facebook-page.mjs`: Page-post and Page-photo reader (paged Graph API), original captions/dates/permalinks, durable uploads to your own Cloudinary account. Tokens only in environment secrets. Initial import might take multiple runs under upload limits.
- `scripts/facebook-core.mjs`: shared categorization, curation and catalogue merge.
- `data/facebook-curation.json`: explicit `includeIds`, `excludeIds` and `categoryOverrides`. Categories: `film-sets`, `television`, `awards`, `career`, `events`.
- `data/facebook-posts.json`: public, browser-readable, normalized catalogue, initially **empty**. Post IDs, date, original caption, original permalink if supplied by Facebook, category, stored image URLs. No API access tokens.
- `facebook-gallery.js` + `facebook-gallery.css`: responsive, filterable website gallery, post attribution and source links, empty state, lazy loading. Uses DOM text nodes to avoid inserting untrusted captions as HTML.
- `.github/workflows/facebook-sync.yml`: manually triggered workflow. Its weekly cron is intentionally **disabled** until Page access and storage are validated, to avoid wasting Actions quota.

## Local historical import (no Meta API required)

1. Obtain the owner's consent and request the Facebook export (JSON, posts and photos, high quality). Do **not** commit, publicly upload, or send the raw ZIP to GitHub; it can contain private content.
2. Run from the repo root with Node.js 22 or newer:

   `node scripts/import-facebook-export.mjs /secure/local/path/to/unzipped-facebook-export`

   The default is **preview only**. Note the displayed IDs and review which posts are about film/television/career. Use `data/facebook-curation.json` to include entries with no keyword or exclude private/irrelevant posts.
3. Once selection is satisfactory, run:

   `node scripts/import-facebook-export.mjs /secure/local/path/to/unzipped-facebook-export --apply`

4. Review the generated `data/facebook-posts.json` and `assets/facebook/` before committing them. These become public when deployed. Keep the original export private.

**Limitations:** Facebook changes export structure. The importer supports common JSON formats but cannot promise every post/photo is matched; missing captions and source links stay missing. Automated relevance uses text keywords/overrides, not computer vision. Visually relevant but uncaptioned photos may need allowlisting.

## Automatic Page sync (only for a genuine Page)

1. Verify Page ownership and Meta Page access. Never share credentials in issues, chats or source files.
2. Confirm the existing Cloudinary account has enough free quota, and add **GitHub Actions repository secrets**:
   - `FACEBOOK_PAGE_ID`: numeric Page ID
   - `FACEBOOK_PAGE_ACCESS_TOKEN`: authorized Page token
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. From GitHub Actions, select **Sync Ramesh Sharma Facebook archive → Run workflow** once. Confirm valid media and captions in the resulting public catalogue. The workflow does not run on push or pull request.
4. Only after a successful manual run, uncomment the weekly `schedule` block in the workflow. Weekly is intentionally conservative. The regular workflow will not automatically deploy if Git-triggered deployments remain disabled in `vercel.json`; configure a secure, controlled deployment method after review.
5. Tokens may expire or permissions may change. Review failed sync runs and rotate credentials as needed.

**Privacy:** A Facebook account owner must approve what is made public. A post becoming private/deleted at Facebook does not automatically remove a website-owned image copy. Add its ID to `excludeIds` and run an import/sync before publishing; separately delete previously uploaded media from Cloudinary as appropriate. No credentials belong in front-end HTML or JavaScript.

**Cloudinary usage:** The script uses signed server-side image uploads and saves only durable `secure_url` values. It does not save temporary `fbcdn` URLs in the public catalogue. Uploaded media counts toward the Cloudinary account's storage and transformation limits.

## Deployment and operational state

This repo currently has `"git": { "deploymentEnabled": false }` in `vercel.json`. A GitHub commit alone therefore does not guarantee a live site update. No deployment changes are made in this work.

This feature should be reviewed and merged separately before enabling authorized imports. There is no imported Facebook data, no live API connection, no completed run and no confirmed live deployment yet.
