# CubePlex Blog Agent Guide

## Blog cover images

Create article cover images as final 2:1 WebP assets at `1280x640`. Keep the
cover visually aligned with the article title and the CubePlex editorial style.

1. Generate a text-free 2:1 background with the built-in image generation tool.
   Reserve uncluttered space for the title. Do not ask the image model to render
   the title or CubePlex logo.
2. Use `scripts/create-blog-cover.mjs` to resize/crop the generated background,
   add the exact title, and overlay the existing CubePlex SVG lockup. For example:

   ```bash
   pnpm create:cover <generated-image> static/img/blog/<slug>-cover.webp
   ```

3. Inspect the exported cover locally before changing an article front matter
   `image` field or committing it. Check that the title is readable, the logo is
   crisp, the crop is 2:1, and no generated text or logo remains in the background.
4. Use `pnpm optimize:images --replace` only for approved legacy PNG cover assets.
   It creates 1280x640 WebP files and removes the corresponding source PNG files.
   Do not run it on an image that must remain an editable source.

Generated blog cover assets are committed under `static/img/blog/` and referenced
from each post's front matter as `/img/blog/<filename>.webp`.
