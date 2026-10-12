# Immersive Film-World Redesign Plan

## Goal
Redesign the existing single-page portfolio so each section feels like a visual chapter from a film director's working life, rather than a conventional portfolio with cinema-themed colors. Preserve the existing verified content, links, navigation, accessibility, and mobile responsiveness. Work only on `redesign/immersive-film-world`; do not modify `main`, Vercel settings, or deployment configuration.

## Content inventory and visual translation

### 1. Opening / Home — “The Director's Stage”
**Existing content:** Ramesh R Sharma; Film Director, Writer, Assistant Director; “From Assistant to Director — A Journey Through Indian Cinema”; career summary; credits and enquiry links; portrait.
**Visual concept:** A theatrical set, not a normal split hero. Layered tungsten practical-light glows, a dark studio backdrop, fine film grain/sprocket details, a subtle diagonal filmstrip motif, and an ivory title-card treatment. Name is the title of the film; role is a compact production slate; tagline is the logline; CTAs are designed like elegant call sheets. Portrait gets a physical-looking frame and archival label. Desktop keeps an editorial composition; mobile stacks the same story without oversized dead space.

### 2. Career ribbon — “The production slate”
**Existing content:** Feature Films, Television, Direction & Writing.
**Visual concept:** A narrow strip of numbered production markers, small perforation details, and brass separators—like a film edge / camera slate. It becomes a readable stacked or horizontally scrollable strip on narrow screens, never causing page overflow.

### 3. Director's Cut — “Selected scenes”
**Existing content:** Three selected directing/writing credits and IMDb link; one behind-the-scenes photo.
**Visual concept:** A contact sheet / edit-bay layout. The photo becomes a framed still with a tiny scene number and “behind the frame” caption. Each selected credit is a scene card with a frame number, role/date metadata, and a fine timeline/playhead motif. No fabricated poster art or unverified facts.

### 4. Biography — “Production notes”
**Existing content:** Origin, career start in 1986, B.R. Films connection, specializations, biography paragraph.
**Visual concept:** A director's dossier / production notebook. Main biography is treated like an editorial page; facts become four production-note tiles with index tabs, generous inset spacing, and warm brass rules. Decorative annotations must never compete with the actual copy.

### 5. Career highlights — “Departments of the craft”
**Existing content:** B.R. Films legacy, television, independent direction, advertising.
**Visual concept:** Four distinct film-department cards, visually inspired by a camera aperture, monitor, script page, and commercial slate through CSS line-art motifs. Each card has a numbered department marker and subtle amber top light; no generic emoji icons.

### 6. Timeline — “Career reel”
**Existing content:** 1986 beginning; 1990 Mahabharat; 1993–96 television; 1997–98 independent direction; 2003 Baghban; 2011 The New Face of India.
**Visual concept:** A vertical strip of film with sprocket holes and a moving/editing playhead; each milestone appears as a scene marker and a small archival slate. Desktop uses a composed alternating timeline; mobile becomes a clean vertical reel. Keep every date and description readable.

### 7. Filmography — “The archive / edit decision list”
**Existing content:** Assistant-director film credits, independent direction, advertising credits, category filters.
**Visual concept:** An editor's archive table meets a paper credit ledger. Each category receives its own visual treatment: film credits as numbered slate cards; directing work as featured scene entries; advertising as compact campaign cards. “Youth Movie” becomes a readable metadata chip, never a wide low-contrast bar. Filters resemble labeled archive tabs and remain accessible.

### 8. Television — “The small-screen wall”
**Existing content:** Three featured TV artworks, descriptions, popular TV serial credits, independent direction list.
**Visual concept:** A television archive wall / broadcast monitor bank. Existing posters are presented as carefully contained vertical artwork with visible frames and captions; each item includes the title, role, and supplied description. The secondary lists become compact episode/credit logs. Do not imply Ramesh held a role beyond what the source content says. Image failure states remain graceful.

### 9. Contact — “End credits”
**Existing content:** Contact invitation, location, experience, specialization, IMDb, Instagram, LinkedIn, Facebook.
**Visual concept:** A closing credit roll: centered end-credit title, production/contact details in a restrained slate, social links as labeled end-credit rows with small directional marks. Retain real link destinations; do not invent an email address or phone number.

## Shared art direction
- Palette: ink black, espresso brown, warm ivory, antique brass, tungsten amber, muted burnt sienna; turquoise is removed from decorative UI unless it is intrinsic to an image.
- Materials: subtle grain/scanline texture, thin brass frames, paper/film edges, light falloff and layered shadows. Avoid overusing gradients or making every card identical.
- Typography: elegant high-contrast serif for story titles; restrained sans-serif for labels and descriptive copy; generous but controlled letter spacing.
- Visual storytelling: section-specific visual metaphors, numbering, captioning, scene/slate metadata and framing. Reuse existing photos/posters only; do not invent credits or depict unrelated people as the director.
- Motion: optional subtle light sweep, playhead/line reveal and card lift. Honor `prefers-reduced-motion`; all content remains visible without animation.
- Responsive: desktop gets richer layered compositions and breathing room; mobile gets simpler, stacked compositions. No horizontal page overflow; text must have real inset padding.
- Accessibility: preserve semantic headings, focus states, contrast, alt text, reduced-motion behavior, and functional navigation/filters.
- Performance: CSS-generated decoration first; no heavy animation libraries, autoplay video, or new external dependencies.

## Implementation sequence
1. **Branch + plan:** create `redesign/immersive-film-world` from current `main`; this document is the design contract.
2. **Visual foundation:** replace the color-only treatment with a shared set of film-material tokens, lighting layers, and section-specific framing. Start with the hero, career ribbon, and Director's Cut.
3. **Narrative sections:** redesign biography, career highlights, and timeline as a dossier, department cards, and film reel.
4. **Archive sections:** redesign filmography and television as an edit list and broadcast archive; fix all metadata contrast and spacing.
5. **Final credits + responsive/accessibility pass:** make contact feel like end credits; check selectors, breakpoints, motion preferences, anchors, and source-level syntax.
6. **Verification:** inspect diffs and source-level structure. Browser screenshots/live visual confirmation will be reported only if genuinely available. No merge to `main` and no Vercel changes without explicit later approval.
