# Original Facebook career media — portfolio implementation

This update was built from the **extracted Facebook export** in the connected Google Drive folder, not from a Facebook embed, a third-party scraper or generated images.

## Media preserved
- 17 selected professional photograph files under `assets/rrs-career/`.
- 6 selected playable clips under `assets/rrs-career/`.
- A manifest in `data/career-gallery.json` records editorial labels, source captions, dates and categories.
- The homepage displays 9 curated visual cards; Behind the Frame displays all 23 selected records, filterable by category.

Original image and video bytes were preserved in Git. Media quality is limited to what the Facebook data export supplied. Some historical images are naturally low-resolution and some post images are composite collages. Nothing has been AI-upscaled or falsely represented as higher resolution.

When available, post captions are preserved verbatim as written in the owner's Facebook export, behind expandable “Read original Facebook caption” sections. These are historical statements made by the account owner and should not be interpreted as independent third-party verification.

Two additional 1600-pixel-wide archival production photographs, dated 14 March 2026 in the export, have no original captions. They are labeled with neutral editorial descriptions; neither production titles nor shooting dates are inferred from the images.

## Source categories
- On-set film and television memories
- Historical work on B.R. Films television productions
- Directing and television serial production
- Film casting, project discussions and industry meetings
- Selected videos including directing briefings, ad-film shoots and archival production memories

The source export may include material that is not intended to be public. Only the selected career-related media is published here, not the entire archive. Personal, political, memorial and unrelated content were excluded.

## What remains
- Optional additional media curation from uncaptioned or incorrectly indexed photographs.
- Browser QA, color/contrast and real device testing.
- Vercel Git integration is enabled for `main` only in `vercel.json` to attempt one production build from the merge; live deployment must still be checked independently.
