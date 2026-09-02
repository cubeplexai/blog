---
name: cubeplex-whiteboard-blog-visuals
description: "Create, brief, review, or revise CubePlex blog illustrations, diagrams, and covers in the observed CubePlex Workspace whiteboard style: a light grid-paper canvas, hand-drawn technical icons, black ink outlines, pale-blue construction shapes, signal-blue product panels, and sparse yellow highlights. Use for a CubePlex blog post's visual concept, image-generation prompt, diagram direction, or visual QA."
---

# CubePlex Whiteboard Blog Visuals

Use a legible technical whiteboard language: an explanatory diagram first, with illustrated details supporting the argument. Read [the visual specification](references/visual-spec.md) before producing a prompt or a review.

## Select the visual form

Choose the smallest form that can carry the claim.

- Use a **concept illustration** for a single relationship or product capability. Compose one central object, two to four supporting icons, and an obvious directional relationship.
- Use a **process diagram** for ordered actions. Place three to five steps on a thin blue horizontal path, with one hand-drawn icon above each step.
- Use a **comparison** only for genuinely competing models. Use two equally sized pale-blue cards, one visual language and one comparison axis per row.
- Use a **cover** for the article’s entry point. Keep the background text-free; reserve one uncluttered region for the title and CubePlex lockup, which the repository cover script adds afterward.

Do not turn an article into a slide deck. One image should explain one claim not already obvious from the adjacent paragraph.

## Build the composition

1. State the one claim, then map it to a single visual metaphor that can be drawn as a technical object, flow, container, or card.
2. Place the main subject in the center or in a large rounded rectangle. Leave roughly one-quarter of the frame empty for a heading, caption, or title overlay.
3. Put contextual icons around the central subject. Use thin hand-drawn arrows, dots, or simple node-edge graphs to express the relationship.
4. Use the faint grid and an even fainter pale-blue network or geometric shape only as structure. It must stay behind the main content.
5. Render factual labels, code, Chinese copy, titles, and CubePlex branding separately in SVG, HTML, or the cover script. Never rely on an image model to draw readable text.

## Prompt image generation precisely

Describe subject matter and layout first, then append the fixed visual language from the reference. Ask for a **text-free** image, no letters, no logos, no watermark, no UI screenshot, and no photorealistic or glossy 3D rendering.

Example prompt fragment:

> Text-free editorial technical illustration of a managed-agent control plane at center, with three isolated sandbox boxes connected by thin arrows; a vault icon remains outside the sandboxes. Spacious wide composition with reserved empty space on the upper left. White grid-paper background, loose black ink outlines, pale-blue construction shapes, small signal-blue scribble fills, one or two muted yellow emphasis marks, friendly hand-drawn engineering notebook style; flat 2D, no text, no logos, no watermark.

For a cover, follow the repository cover procedure: generate a text-free 5:2 background, export the final 1280×512 WebP using `pnpm create:cover`, and inspect the resulting image before updating front matter. Do not generate the article title or CubePlex logo in the background.

## Apply hierarchy and color

- Keep the canvas predominantly off-white. Use black ink for the primary contour and charcoal for any added text overlay.
- Make product or active-state objects blue. Use pale blue for cards and background construction shapes.
- Use yellow only as an annotation or highlighter mark for the few terms that need emphasis. It is not a panel, background, or brand replacement.
- Allow small teal, green, orange, and skin-tone accents only to distinguish concrete props or people; retain the blue/black/yellow hierarchy.
- Prefer friendly simplified line icons: robot, lock, key, document, cube, server stack, screen, person, gears, graph nodes, magnifier, or tool. Give filled areas a subtle pencil/scribble texture, not a clean vector gradient.

## Review before committing

Check the rendered asset at its intended placement and size.

- The main claim is visible without reading a caption.
- The image uses generous whitespace and does not crowd every edge with icons.
- Outline weight, hand-drawn texture, blue hierarchy, and restrained yellow emphasis match the reference.
- Lines, arrows, icons, and exported text are crisp; no generated pseudo-text, logo, watermark, or unintentional mixed language remains.
- The visual communicates a real product boundary. Keep secret, sandbox, and control-plane boundaries technically accurate; do not imply unshipped features.
- A cover is 5:2, 1280×512 WebP, title-readable after overlay, and includes the real CubePlex lockup only through the cover workflow.
