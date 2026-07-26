# CubePlex Blog Agent Guide

## Chinese editorial writing

Before drafting, restructuring, translating, or reviewing Chinese blog content,
read and follow `.agents/skills/write-cubeplex-blog-zh/SKILL.md`. Apply it to
Chinese titles, outlines, and MDX posts. Prefer direct, specific statements over
metaphors, parallel slogans, hypothetical setups, rhetorical questions, and
chat-style navigation.

## Blog cover images

Create new article cover images as final 5:2 WebP assets at `1280x512`. Keep the
cover visually aligned with the article title and the CubePlex editorial style.

1. Generate a text-free 5:2 background with the built-in image generation tool.
   Reserve uncluttered space for the title. Do not ask the image model to render
   the title or CubePlex logo.
2. Use `scripts/create-blog-cover.mjs` to resize/crop the generated background,
   add the exact title, and overlay the existing CubePlex SVG lockup. For example:

   ```bash
   pnpm create:cover <generated-image> static/img/blog/<slug>-cover.webp
   ```

3. Inspect the exported cover locally before changing an article front matter
   `image` field or committing it. Check that the title is readable, the logo is
   crisp, the crop is 5:2, and no generated text or logo remains in the background.
4. Use `pnpm optimize:images --replace` only for approved legacy PNG cover assets.
   It intentionally keeps those existing covers at 1280x640 (2:1) and removes
   the corresponding source PNG files. Do not use it for new covers or on an
   image that must remain an editable source.

Generated blog cover assets are committed under `static/img/blog/` and referenced
from each post's front matter as `/img/blog/<filename>.webp`. Existing 2:1 posts
use `coverAspectRatio: '2:1'`; new 5:2 posts should omit that legacy marker.
