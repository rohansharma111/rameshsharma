# Career gallery — image sources and standards

The photo and video gallery is a director's visual portfolio, with **24 selected original photographs and 22 selected video clips**, a total of 46 professionally relevant career records. Its content is based on the director's data export and earlier verified portfolio photographs; the website does not identify the import source in gallery labels or require visitors to leave the site to read captions.

## Editorial rules
- Present each career item with its own professional title and caption. Long captions can expand inline with **Read more**.
- Show only authentic archival photos and video material; do not replace originals with stock imagery or fabricated screenshots.
- Use neutral descriptions when the source record lacks a caption; do not assign an unverified production title.
- Preserve original image/video bytes. Where the source export is low-resolution, do not claim it is high-resolution.
- Treat production statements contained in archival captions as historical first-person recollections, not independent third-party verification.
- Keep public-facing UI free of "Facebook import," "source file," "read caption on Facebook," or similar provenance instructions.

## Site integration
- `index.html#visual-stories`: 12-image/video homepage showcase.
- `behind-the-frame.html#visual-archive`: all 46 career moments, category filters and full-image viewer.
- `data/career-gallery.json`: machine-readable media inventory; fields are editorial metadata.
- `assets/rrs-career/`: original media.
- `visual-archive.css` and `visual-archive.js`: presentation, filters, and image viewer.

The photos and clips have been selected conservatively to exclude obviously unrelated or personal posts; the entire export is not automatically published. Additional archival materials may be curated when their professional relevance can be verified.

## Delivery
Code changes can trigger Vercel production deployment from main only; verify release status and real page rendering after merge.
