# Visual archive — sources and editorial standards

## What the gallery actually shows

This change replaces the scrollable Facebook and Instagram embeds with a real, responsive image grid and a full-image viewer. It puts a visual gallery on the homepage before the filmography, and a filterable companion gallery on Behind the Frame.

Only images already included in the portfolio are shown:

1. **Behind-the-scenes career photograph** — existing Cloudinary file `DSC08995_lnmion.jpg`, previously displayed in the Director's Cut section; existing site's image description calls it a photograph from Ramesh R Sharma's filmmaking work. No individual Facebook post attribution or original Facebook caption has been verified.
2. **Portrait** — existing Cloudinary file `IMG-20210510-WA0031_qj7vcw.jpg`, previously used as the homepage hero portrait. No Facebook post caption has been verified.
3. **Mahabharat** — existing Amazon/IMDb image used as identified television-series artwork in the TV section, **not** described as a photo of Ramesh R Sharma; accompanying role is drawn from the site's current credits.
4. **Vishnu Puran** — existing Amazon/IMDb artwork as previously displayed in the television section, **not** described as a photo of Ramesh R Sharma.

Because the site is public, verify permissions to reuse poster artwork. Image URLs are linked to their unaltered source images; there is no new image upscaling or rasterization from a mobile screenshot. Cropping is constrained to display styling, and the viewer opens original source media.

## What it does not claim

- These items are **not** represented as a complete Facebook archive.
- Editorial text is **not** presented as the original caption of a Facebook post.
- Casting, awards and other professional photographs are **not** fabricated or filled with photos of unrelated people.
- Public Facebook profile visibility and a functioning Facebook Page Plugin **do not** provide structured access to all historical photos, high-resolution media or their captions. That requires the underlying original files/posts to be accessible.

## Adding more authentic material

Replace the curated HTML cards with additional images only when the image belongs to Ramesh or a production he worked on and the photo's origin and display rights are known. Keep original Facebook captions separately from portfolio editorial copy. Prefer an original-quality image owned by the photographer/family rather than a screenshot or an embedded-feed thumbnail.

The current gallery design supports flexible numbers of cards in each category. Front-end assets: `visual-archive.css` and `visual-archive.js`. Key website sections: `index.html#visual-stories` and `behind-the-frame.html#visual-archive`.

Live deployment is not automatically triggered by this commit: `vercel.json` disables Git deployments.
