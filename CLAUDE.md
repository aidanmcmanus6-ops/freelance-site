make sure that any time a new blog post is added it must be added to the vite.config.js or else when clicking on the link it will 404

## New blog post checklist (every step is required)

1. Create `blog/<slug>/index.html` (copy an existing post for the head/schema patterns).
2. Register the page in `vite.config.js` under `rollupOptions.input` (the page 404s in production without this).
3. Add the post URL to `public/sitemap.xml`.
4. Update the blog index (`blog/index.html` — the "Field Catalog"):
   - The newest post becomes the featured spread (entry 01): update its title, excerpt, category color class (`blog-cat-web`/`blog-cat-ai`/`blog-cat-mon`), `data-cat`, spec-sheet rows, and serial number.
   - Move the previous featured post into the mosaic grid as a normal entry.
   - Keep REF codes (`Ref XXX·NN`) and ghost numerals (`cat-num`) sequential.
   - Update the masthead line ("Issue NN · Month Year · N entries").
   - Give the new grid wrapper a float duration/delay (`--fd`/`--fdel`), a reveal delay (`--d`), and a mosaic span class (`cat-span-2`, `cat-span-4`, or `cat-strip`+`cat-strip-wrap` for the closing full-width row — keep each mosaic row summing to 6 columns).

## Site conventions

- Category accent colors: Web Design `#8b5cf6` (purple), AI & Automation `#38bdf8` (cyan), Monitoring `#34d399` (green).
- Shared static-page behavior (header shrink, scroll progress, reveals, card physics, service-page accents) lives in `src/page.js` + `blog-cards.css`. Home-page equivalents live in `src/App.jsx` + `hero-tech.css`.
- The service pages get their identity classes (`page-web`/`page-ai`/`page-mon`) added by `page.js` from the URL — no body-class edits needed in their HTML.
- All motion must respect `prefers-reduced-motion`; pointer effects are mouse-only (`pointer: fine`).
