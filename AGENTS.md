# CubePlex Blog Agent Guide

## Chinese editorial writing

Before drafting, restructuring, translating, or reviewing Chinese blog content,
read and follow `.agents/skills/write-cubeplex-blog-zh/SKILL.md`. Apply it to
Chinese titles, outlines, and MDX posts. Prefer direct, specific statements over
metaphors, parallel slogans, hypothetical setups, rhetorical questions, and
chat-style navigation.

## Reader-facing prose

Blog posts address readers, not the editor or the writing process. Do not put
editorial instructions, research disclaimers, or promises about what “this
article” will or will not do into a title, description, introduction, body, or
conclusion. Avoid formulations such as “本文不把……写成……”, “this article does
not…”, “作者判断”, or explanations of how the draft was researched. This also
applies to terminology decisions: do not write that a competitor calls itself
“Super Agent”, explain that the label is marketing, and then tell readers which
neutral term the article will use. Use the neutral term directly. Retain the
competitor's exact label only when the label itself affects the comparison, and
attribute it without explaining the editorial process.

When a feature is unshipped or partially implemented, state the reader-relevant
fact directly: name the current behavior, the missing path or constraint, and
the source. For example, write that a trigger pipeline currently accepts only
`inline` targets and returns `not implemented` for another target; do not tell
the reader that the author has chosen not to describe it as a capability.

Official CubePlex posts speak for the product. State shipped product behavior
directly as “CubePlex supports”, “CubePlex provides”, or “CubePlex uses”, rather
than distancing the author with “CubePlex documentation describes” or “the
documentation says”. Cite a versioned document or source file when it supports
a specific implementation detail, release scope, or limitation; the citation is
evidence, not a substitute for the product's own voice.

## Competitor comparison articles

Write comparisons from the product experience a prospective customer can see,
then support that explanation with implementation evidence. Internal fields,
database ownership columns, filesystem paths, and class names belong in source
notes unless they are necessary to understand a real deployment constraint.
For a beginner-facing explanation, describe what appears after a user signs in,
what an administrator configures, what teammates share, and what remains after
a member leaves.

- Start with the products' usage model and ownership boundary, not a feature
  inventory. Distinguish “one deployment can host many isolated users” from
  “several members jointly own and operate one Agent environment.”
- Translate abstract positioning into a choice the reader can picture. For
  example, compare “open one general Agent and ask it to handle different work”
  with “select or build a separate App for each scenario”; replace phrases such
  as “long-term context and governance boundary” with concrete ownership of the
  Agent's identity, memory, tools, accounts, files, and member access.
- Treat vendor terms such as “Super Agent”, “Agent OS”, and “enterprise-grade”
  as product language, not neutral technical categories. Do not repeat a
  competitor's superlative in the title, description, comparison table, or
  primary noun if it creates an unsupported hierarchy between products.
- Official CubePlex comparisons should make CubePlex's advantages legible, while
  remaining factually fair. Acknowledge material competitor strengths, but do
  not introduce feature parity with weakening constructions such as “CubePlex
  also supports…” or imply that CubePlex has a lesser implementation without
  evidence. State the shared capability symmetrically, then explain the verified
  difference in ownership, policy, persistence, approval, or operation.
- Explain `Workspace` as a concrete product shape with a stable Agent identity,
  shared team knowledge, approved Skills and MCP connectors, scoped credentials,
  and separate private or shared work contexts. Make clear what belongs to the
  Workspace Agent, what belongs to a conversation, and what belongs to a member.
- Product analogies are locale-specific and should normally appear once. In
  Chinese, WorkBuddy is the proper name of a familiar personal desktop Agent,
  not an English translation of “工作伙伴”; use it once to explain that a
  CubePlex Workspace resembles a team version of that product, then return to
  “Workspace Agent” or “Agent”. In English, use OpenClaw for the equivalent
  comparison because WorkBuddy is not broadly recognized. Do not turn either
  product name into a generic noun, repeated nickname, SEO tag, or substitute
  for CubePlex terminology.
- Use analogies only when every part maps to shipped behavior. Map the comparison
  immediately to Persona, memory, tools, credentials, membership, conversations,
  and execution environments. Do not let “one Agent with a computer” imply one
  Sandbox per Workspace when Sandboxes are actually scoped by user,
  conversation, or topic.
- Describe scope separately for each resource. Do not claim that all resources
  mechanically have user / workspace / org layers. For example, CubePlex Skills
  follow catalog -> organization install -> Workspace enablement, while MCP
  credentials and Memory have explicit user / workspace / org scope choices.
- Separate Sandbox compute lifetime from data lifetime. Say whether allocation
  follows a run, thread, user, conversation, or topic; whether the container or
  Pod can be reclaimed; and whether files survive through a host mount, PVC, or
  another persistent store. Do not use “persistent Sandbox” when only its data
  is guaranteed to persist.
- Explain persistence through user actions before implementation details: close
  a chat, return the next day, start a fresh conversation, let another member
  continue, restart the runtime, and delete the workspace. The important product
  distinction is often what the files follow. A thread-scoped filesystem keeps
  one conversation's work; a Workspace-scoped personal or shared worksite can
  remain available across conversations and team handoffs.
- Compare security as a sequence of boundaries: identity and membership, tool
  enablement, credential storage and delivery, Sandbox isolation, outbound
  network policy, human approval, and administrator blast radius. Include
  defaults and backend limitations. “Both support network control” is
  incomplete when one defaults to open or supports the policy only on a subset
  of Sandbox providers.
- Distinguish redaction from secret exclusion. A secret passed as a real
  per-command environment value enters the Sandbox process even if logs and
  outputs are redacted. CubePlex secret env entries use opaque placeholders and
  exchange the real value outside the Sandbox at the egress boundary, subject
  to destination-host and optional header restrictions. State this difference
  plainly without reducing the whole security comparison to “safer”.
- When competitor documentation is incomplete, inspect its current source and
  pin the analyzed commit. Re-check CubePlex source at a named commit as well.
  Correct stale claims before preserving approved positioning; a previous draft
  is not evidence for current behavior.
- For a named competitor comparison, add a restrained `<Competitor> Alternative`
  tag when it matches the article's search intent. Do not force the keyword into
  reader-facing sentences or imply drop-in compatibility unless that has been
  verified.

## Blog cover images

Create both WebP and JPG cover assets for every new article. Keep them visually
aligned with the article title and the CubePlex editorial style:

- the site cover is 5:2 at `1280x512`, named `<slug>-cover.webp` (or
  `<slug>-cover-en.webp`), with a same-size `.jpg` companion;
- the share cover is `1356x1056` (the exact ratio of
  `cubeplex-open-source-release-share-zh.jpg`), named `<slug>-cover-share.webp`
  (or `<slug>-cover-share-en.webp`), with a same-size `.jpg` companion. It is for
  platforms that use a taller preview card and does not replace the front matter
  site-cover path.

1. Generate text-free backgrounds for both output ratios with the built-in image
   generation tool. Reserve uncluttered space for the title. Do not ask the image
   model to render the title or CubePlex logo.
2. Use `scripts/create-blog-cover.mjs` to resize/crop each background, add the
   exact title, and overlay the existing CubePlex SVG lockup. Use
   `--highlight-lines` and `--highlight-widths` to place a restrained yellow
   marker behind one or two important title lines; the marker sits behind black
   text and is not a substitute for contrast. For example:

   ```bash
   pnpm create:cover <wide-background> static/img/blog/<slug>-cover.webp \
     --title $'Exact title\\nwith line breaks' --highlight-lines 2 --highlight-widths 360
   pnpm create:cover <share-background> static/img/blog/<slug>-cover-share.webp \
     --preset share --title $'Exact title\\nwith line breaks' --highlight-lines 2 --highlight-widths 440
   ```

3. Export JPG companions from the same composited cover, not by asking the image
   model for a second rendering. Inspect every WebP/JPG pair locally before
   changing an article front matter `image` field or committing them. Check that
   the title is readable, the logo is crisp, the crop matches its output ratio,
   the yellow marker does not obscure text, and no generated text or logo remains
   in the background.
4. Use `pnpm optimize:images --replace` only for approved legacy PNG cover assets.
   It intentionally keeps those existing covers at 1280x640 (2:1) and removes
   the corresponding source PNG files. Do not use it for new covers or on an
   image that must remain an editable source.

Generated blog cover assets are committed under `static/img/blog/`. Front matter
references the 5:2 WebP asset as `/img/blog/<filename>.webp`; JPG companions and
share assets are committed alongside it for platform-specific distribution.
Existing 2:1 posts use `coverAspectRatio: '2:1'`; new 5:2 posts should omit that
legacy marker.

## 内容源与双语

- 中文文章位于 `i18n/zh-Hans/docusaurus-plugin-content-blog/`，英文对应文章位于 `blog/`。修改中文内容时，检查英文版本是否需要同步。
- 当用户要求先确认中文版时，只修改中文稿；在用户明确确认后再同步英文，避免英文稿和视觉资源反复追随未定稿的定位。
- Managed Agents 文章的主要判断是：Sandbox 内 Harness 更适合有明确开始和结束的单次自动化任务；长期运行、等待事件或服务多个用户的 Managed Agent 更适合由控制面持有 Harness，Sandbox 作为可租用、可替换、可并行的执行资源。
- 不把未来架构写成已交付能力。当前文章不再包含 Managed Agent definition、一对多 Sandbox 编排等产品状态声明；CubePlex 的产品选择只在文章结尾讨论。
- 公众号稿源文件位于 `wechat/` 目录（提交 GitHub 存档，不属于 Docusaurus 站点，不发布到博客）。公众号稿从 `wechat/` 下当前 MDX 重新生成，不从旧的 `/tmp` HTML 手工摘录；文章内容有变化时，先改 MDX，再运行 formatter。目录约定见 `wechat/README.md`。
- 公众号稿已按要求移除参考资料、博客原文链接和普通 HTML 外链；文末沿用“关于 / CubeLoop / CubePlex”介绍，官网地址作为普通文本。

## 图表与视觉

- 为博客文章创建、构思、审阅或修改贴图、图解和封面时，先读取并遵循 `.agents/skills/cubeplex-whiteboard-blog-visuals/SKILL.md`。它定义白板式技术插图的构图、色彩、提示词和视觉验收；封面仍须遵循上方的 5:2 生成、标题与 SVG lockup 叠加流程。
- 竞品文章的主图应表达读者能理解的产品形态，例如“多个场景 App”与“同一个长期 Workspace Agent”，或“个人 Agent 环境”与“团队 Agent Workspace”。WorkBuddy / OpenClaw 这类产品参照用于正文解释，不默认进入标题、标签或图中。正文定位确认后再定稿图片；不要让旧图继续强化已经被正文放弃的技术分类。
- 视觉参考是 `static/img/blog/opensandbox-vs-cubesandbox/` 下的 SVG：深色 CubePlex 画布、细网格、黑色面板、蓝色主路径和灰色辅助节点。不要直接使用 diagram skill 的默认主题。
- Managed Agents 图的源文件由 `scripts/create-managed-agents-diagrams.mjs` 生成，修改布局、颜色或标签时改生成脚本，不要只改导出的 SVG。
- 当前图表为横版：`harness-placement-comparison` 为两种 Harness 架构并排对比，`control-plane-multi-sandbox` 为控制面与多 Sandbox lease 编排。中英文 SVG 和 `@2x.png` 都要同步生成。
- Sandbox 是独立的视觉类别：两张图中 Sandbox 容器和 Sandbox A/B/C 使用同一套青绿色背景/边框；Harness 使用蓝色；Vault、Execution API 和其他辅助节点使用灰色。
- 图中要明确 secrets/env 的边界：Sandbox 内 Harness 把运行凭据放在 Sandbox 同一故障边界内；控制面 Harness 将长期 secrets 留在 Vault/Broker，仅向 Sandbox lease 注入任务级 env 或短期 token。
- 生成图表后用 `view_image` 检查实际 PNG，确认没有文字溢出、连线错位或中英文混用。

## 微信公众号预发布

- 项目内 skill 位于 `.agents/skills/wechat-publisher/`。凭据只写入该目录下被忽略的 `config.json`，不要提交、打印或粘贴 AppSecret；`token_cache.json` 同样被忽略。
- CubePlex 固定排版规范见 `.agents/skills/wechat-publisher/references/CUBEPLEX_STYLE.md`，转换器为 `.agents/skills/wechat-publisher/scripts/cubeplex_formatter.py`。
- 生成预览（源文件用 `wechat/` 下的 MDX；`--link-map` 把站内相对链接映射为已发表的公众号文章链接，映射文件为 `.agents/skills/wechat-publisher/references/wechat-links.json`）：

  ```bash
  python3 .agents/skills/wechat-publisher/scripts/cubeplex_formatter.py \
    wechat/2026-08-27-cubeplex-open-source-release.mdx \
    /tmp/wechat-open-source/article_styled.html \
    --url https://cubeplex.ai/blog/zh-Hans/cubeplex-open-source-release \
    --repo /Users/chris/work/blog \
    --link-map .agents/skills/wechat-publisher/references/wechat-links.json
  ```

- 必须先让用户查看 `/tmp/wechat-managed-agents/article_styled.html` 并明确确认，再调用微信 API。publisher 的目标是微信公众号草稿箱，不是直接群发。
- 如果 HTTPS 报 Python SSL 错误，换用带 SSL 的 Python/虚拟环境安装 `requests`；不要修改或暴露 AppSecret。若微信返回 `40164`，在公众号后台「设置与开发 → 基本配置 → IP 白名单」添加当前公网出口 IP。
- 发布前检查 HTML 仅包含微信安全子集标签，样式带 `!important`，本地图片已复制到临时目录；不要把 `/tmp` 预览文件提交到 Git。

## 验证与 Git

- 修改文章、图表或主题后运行 `git diff --check`；博客内容变更后运行 `pnpm check`，它覆盖中英文构建、TypeScript 和 URL 检查。
- 只提交明确属于本次任务的文件。确认 `git status --short --untracked-files=all` 中没有 `config.json`、`token_cache.json`、构建目录或临时预览。
- 根分支当前为 `main`；提交前确认本地分支和远端状态，不使用破坏性 reset/checkout 覆盖用户改动。
