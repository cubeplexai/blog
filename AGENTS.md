# CubePlex Blog Agent Guide

## Chinese editorial writing

Before drafting, restructuring, translating, or reviewing Chinese blog content,
read and follow `.agents/skills/write-cubeplex-blog-zh/SKILL.md`. Apply it to
Chinese titles, outlines, and MDX posts. Prefer direct, specific statements over
metaphors, parallel slogans, hypothetical setups, rhetorical questions, and
chat-style navigation.

## Blog cover images

Create two final WebP cover assets for every new article. Keep both visually
aligned with the article title and the CubePlex editorial style:

- the site cover is 5:2 at `1280x512`, named `<slug>-cover.webp` (or
  `<slug>-cover-en.webp`);
- the share cover is `1356x1056` (the exact ratio of
  `cubeplex-open-source-release-share-zh.jpg`), named `<slug>-cover-share.webp`
  (or `<slug>-cover-share-en.webp`). It is for platforms that use a taller
  preview card and does not replace the front matter site-cover path.

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

3. Inspect both exported covers locally before changing an article front matter
   `image` field or committing them. Check that the title is readable, the logo is
   crisp, the crop matches its output ratio, the yellow marker does not obscure
   text, and no generated text or logo remains in the background.
4. Use `pnpm optimize:images --replace` only for approved legacy PNG cover assets.
   It intentionally keeps those existing covers at 1280x640 (2:1) and removes
   the corresponding source PNG files. Do not use it for new covers or on an
   image that must remain an editable source.

Generated blog cover assets are committed under `static/img/blog/`. Front matter
references the 5:2 asset as `/img/blog/<filename>.webp`; share assets are committed
alongside it for platform-specific distribution. Existing 2:1 posts use
`coverAspectRatio: '2:1'`; new 5:2 posts should omit that legacy marker.

## 内容源与双语

- 中文文章位于 `i18n/zh-Hans/docusaurus-plugin-content-blog/`，英文对应文章位于 `blog/`。修改中文内容时，检查英文版本是否需要同步。
- Managed Agents 文章的主要判断是：Sandbox 内 Harness 更适合有明确开始和结束的单次自动化任务；长期运行、等待事件或服务多个用户的 Managed Agent 更适合由控制面持有 Harness，Sandbox 作为可租用、可替换、可并行的执行资源。
- 不把未来架构写成已交付能力。当前文章不再包含 Managed Agent definition、一对多 Sandbox 编排等产品状态声明；CubePlex 的产品选择只在文章结尾讨论。
- 公众号稿源文件位于 `wechat/` 目录（提交 GitHub 存档，不属于 Docusaurus 站点，不发布到博客）。公众号稿从 `wechat/` 下当前 MDX 重新生成，不从旧的 `/tmp` HTML 手工摘录；文章内容有变化时，先改 MDX，再运行 formatter。目录约定见 `wechat/README.md`。
- 公众号稿已按要求移除参考资料、博客原文链接和普通 HTML 外链；文末沿用“关于 / CubePi / CubePlex”介绍，GitHub 地址作为普通文本。

## 图表与视觉

- 为博客文章创建、构思、审阅或修改贴图、图解和封面时，先读取并遵循 `.agents/skills/cubeplex-whiteboard-blog-visuals/SKILL.md`。它定义白板式技术插图的构图、色彩、提示词和视觉验收；封面仍须遵循上方的 5:2 生成、标题与 SVG lockup 叠加流程。
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
