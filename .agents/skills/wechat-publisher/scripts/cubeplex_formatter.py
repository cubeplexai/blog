#!/usr/bin/env python3
"""Convert a CubePlex blog MDX post into WeChat-safe branded HTML."""

from __future__ import annotations

import argparse
import html
import re
import shutil
from pathlib import Path


TOKENS = {
    "ink": "#0a0a0b",
    "body": "#1f1f22",
    "muted": "#52525b",
    "quiet": "#71717a",
    "border": "#e4e4e7",
    "soft": "#f4f4f5",
    "accent": "#5b7cfa",
    "white": "#ffffff",
}

BODY_STYLE = (
    "margin: 0 0 18px 0 !important; padding: 0 !important; "
    f"color: {TOKENS['body']} !important; font-size: 17px !important; "
    "font-weight: 400 !important; line-height: 1.85 !important; "
    "letter-spacing: 0 !important; text-align: left !important; "
    "text-indent: 0 !important;"
)

LINK_STYLE = (
    f"color: {TOKENS['accent']} !important; font-weight: 500 !important; "
    "text-decoration: none !important;"
)


def parse_front_matter(source: str) -> tuple[dict[str, str], str]:
    match = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", source, re.S)
    if not match:
        return {}, source
    metadata: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip("'\"")
    return metadata, match.group(2)


def render_inline(text: str, source_url: str) -> str:
    placeholders: list[str] = []

    def keep(value: str) -> str:
        placeholders.append(value)
        return f"@@CUBEPLEX{len(placeholders) - 1}@@"

    def link(match: re.Match[str]) -> str:
        label = html.escape(match.group(1), quote=False)
        return keep(label)

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(
        r"`([^`]+)`",
        rf'<span style="padding: 1px 4px !important; border-radius: 4px !important; '
        rf'background-color: {TOKENS["soft"]} !important; color: {TOKENS["ink"]} !important; '
        r'font-size: 15px !important; text-indent: 0 !important;">\1</span>',
        text,
    )
    for index, value in enumerate(placeholders):
        text = text.replace(f"@@CUBEPLEX{index}@@", value)
    return text


def resolve_image(src: str, repo: Path, output_dir: Path) -> str:
    path = repo / "static" / src.lstrip("/") if src.startswith("/img/") else repo / src
    if path.suffix.lower() == ".svg":
        png_2x = path.with_name(path.stem + "@2x.png")
        png = path.with_suffix(".png")
        path = png_2x if png_2x.exists() else png
    if not path.exists():
        raise FileNotFoundError(f"Article image not found: {path}")
    destination = output_dir / path.name
    shutil.copy2(path, destination)
    return destination.name


def split_blocks(body: str) -> list[str]:
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    return [block.strip() for block in re.split(r"\n\s*\n", body) if block.strip()]


def render_post(source_path: Path, output_path: Path, public_url: str, repo: Path) -> tuple[str, str]:
    metadata, body = parse_front_matter(source_path.read_text(encoding="utf-8"))
    title = metadata.get("title", source_path.stem)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    parts: list[str] = []
    skip_references = False

    for block in split_blocks(body):
        if block.startswith("## "):
            heading_text = block[3:].strip()
            if heading_text == "参考资料":
                skip_references = True
                continue
            if skip_references:
                continue
            heading = render_inline(heading_text, public_url)
            parts.append(
                '<p style="margin: 42px 0 18px 0 !important; padding: 0 0 9px 0 !important; '
                f'border-bottom: 1px solid {TOKENS["border"]} !important; color: {TOKENS["accent"]} !important; '
                'font-size: 23px !important; font-weight: 700 !important; line-height: 1.4 !important; '
                f'letter-spacing: -0.2px !important; text-align: left !important; text-indent: 0 !important;">{heading}</p>'
            )
            continue

        if skip_references:
            continue

        image_match = re.fullmatch(r"!\[([^\]]*)\]\(([^)]+)\)", block)
        if image_match:
            alt, src = image_match.groups()
            local_src = resolve_image(src, repo, output_path.parent)
            parts.append(
                '<p style="margin: 30px 0 10px 0 !important; padding: 0 !important; '
                'text-align: center !important; text-indent: 0 !important;">'
                f'<img src="{html.escape(local_src, quote=True)}" alt="{html.escape(alt, quote=True)}" '
                f'style="margin: 0 !important; padding: 0 !important; border: 1px solid {TOKENS["border"]} !important; '
                'border-radius: 8px !important; width: 100% !important; text-indent: 0 !important;"></p>'
            )
            parts.append(
                '<p style="margin: 0 0 28px 0 !important; padding: 0 !important; '
                f'color: {TOKENS["quiet"]} !important; font-size: 13px !important; font-weight: 400 !important; '
                f'line-height: 1.6 !important; text-align: center !important; text-indent: 0 !important;">{html.escape(alt)}</p>'
            )
            continue

        if block.startswith("- "):
            for item in block.splitlines():
                item = re.sub(r"^-\s+", "", item.strip())
                parts.append(
                    '<p style="margin: 0 0 12px 0 !important; padding: 0 0 0 15px !important; '
                    f'border-left: 2px solid {TOKENS["border"]} !important; color: {TOKENS["muted"]} !important; '
                    'font-size: 14px !important; font-weight: 400 !important; line-height: 1.75 !important; '
                    f'text-align: left !important; text-indent: 0 !important;">{render_inline(item, public_url)}</p>'
                )
            continue

        paragraph = " ".join(line.strip() for line in block.splitlines())
        parts.append(f'<p style="{BODY_STYLE}">{render_inline(paragraph, public_url)}</p>')

    about_border = f"border-top: 1px solid {TOKENS['border']} !important;"
    about_heading = (
        f"color: {TOKENS['accent']} !important; font-size: 17px !important; "
        "font-weight: 700 !important; line-height: 1.5 !important; text-align: left !important; "
        "text-indent: 0 !important;"
    )
    about_body = (
        f"color: {TOKENS['muted']} !important; font-size: 14px !important; "
        "font-weight: 400 !important; line-height: 1.75 !important; text-align: left !important; "
        "text-indent: 0 !important;"
    )
    parts.extend([
        f'<p style="margin: 42px 0 18px 0 !important; padding: 18px 0 0 0 !important; {about_border} '
        f'color: {TOKENS["quiet"]} !important; font-size: 13px !important; font-weight: 600 !important; '
        'line-height: 1.5 !important; letter-spacing: 1px !important; text-align: left !important; text-indent: 0 !important;">关于</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_heading}">CubePi</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_body}">原生支持异步的 Python Agent Harness 框架，专为高性能、高可读性及生产级持久化能力而设计。</p>',
        f'<p style="margin: 0 0 20px 0 !important; padding: 0 !important; {about_body}">https://github.com/cubeplexai/cubepi</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_heading}">CubePlex</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_body}">CubePlex 是一个全栈 AI 智能体工作空间。你可以在这一个平台内使用多模型对话、可安装技能、持久化记忆、MCP 工具集成以及任务自动化功能。</p>',
        f'<p style="margin: 0 !important; padding: 0 !important; {about_body}">https://github.com/cubeplexai/cubeplex</p>',
    ])

    rendered = "\n".join(parts) + "\n"
    output_path.write_text(rendered, encoding="utf-8")
    return title, metadata.get("description", "")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--url", required=True)
    parser.add_argument("--repo", type=Path, required=True)
    args = parser.parse_args()
    title, description = render_post(args.source, args.output, args.url, args.repo)
    print(f"title={title}")
    print(f"description={description}")
    print(f"output={args.output}")


if __name__ == "__main__":
    main()
