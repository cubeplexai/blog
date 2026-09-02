# 微信公众号内容

公众号文章的源文件目录。内容提交到 GitHub 存档，但不属于 Docusaurus 站点，不会被发布到博客。

## 目录约定

- 每篇公众号稿一个 `YYYY-MM-DD-<slug>.mdx` 文件，front matter 沿用博客格式（`title`、`description`、`image` 供 formatter 和发布脚本使用）。
- 排版转换使用 `.agents/skills/wechat-publisher/scripts/cubeplex_formatter.py`，样式规范见 `.agents/skills/wechat-publisher/references/CUBEPLEX_STYLE.md`。
- 转换产物（styled HTML、转换后的图片）是临时文件，写入 `/tmp`，不提交到 Git。

## 重新生成预览

```bash
python3 .agents/skills/wechat-publisher/scripts/cubeplex_formatter.py \
  wechat/2026-08-27-cubeplex-open-source-release.mdx \
  /tmp/wechat-open-source/article_styled.html \
  --url https://cubeplex.ai/blog/zh-Hans/cubeplex-open-source-release \
  --repo /Users/chris/work/blog \
  --link-map .agents/skills/wechat-publisher/references/wechat-links.json
```

`--link-map` 把站内相对链接映射为已发表的公众号文章链接（`wechat-links.json`），映射到 `mp.weixin.qq.com` 的链接在正文中保留为可点击 `<a>`。

## 发布

预览经人工确认后，用 `.agents/skills/wechat-publisher/scripts/publisher.py` 推送到公众号草稿箱（不是直接群发）。封面图单独作为文章缩略图上传，正文头图由 formatter 从 front matter `image` 自动生成。
