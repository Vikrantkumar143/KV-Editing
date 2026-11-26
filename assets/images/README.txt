Images: this build uses high-quality external photography from Unsplash
(loaded via URL, so an internet connection is needed on first view).

To make the site fully self-contained/offline:
1. Download your chosen photos into this folder (assets/images/).
2. Optionally convert them to WebP for faster loading.
3. Replace the https://images.unsplash.com/... src values in the HTML
   with local paths, e.g. src="assets/images/wedding-01.webp".
All <img> tags already include descriptive alt text and loading="lazy".
