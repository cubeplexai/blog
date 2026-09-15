#!/usr/bin/env python3
"""Convert a CubePlex blog MDX post into WeChat-safe branded HTML."""

from __future__ import annotations

import argparse
import html
import re
import shutil
import subprocess
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

RECOMMENDED_READING = (
    ("CubePlex -- 企业级 Agent 平台正式开源", "./cubeplex-open-source-release"),
    ("从 Agent computer 到团队交付：QM 与 CubePlex 的两条路径", "./qm-cubeplex-team-agent-collaboration"),
    ("Managed Agents Harness 架构与选择", "./managed-agents-cloud-harness-vs-sandbox-harness"),
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


def render_inline(
    text: str,
    source_url: str,
    expand_links: bool = False,
    link_map: dict[str, str] | None = None,
) -> str:
    placeholders: list[str] = []
    link_map = link_map or {}

    def keep(value: str) -> str:
        placeholders.append(value)
        return f"@@CUBEPLEX{len(placeholders) - 1}@@"

    def link(match: re.Match[str]) -> str:
        label, url = match.group(1), match.group(2)
        resolved = link_map.get(url, url)
        if resolved.startswith("https://mp.weixin.qq.com/"):
            anchor = (
                f'<a href="{html.escape(resolved, quote=True)}" target="_blank" '
                f'style="{LINK_STYLE}">{html.escape(label, quote=False)}</a>'
            )
            return keep(anchor)
        if expand_links and resolved.startswith("http") and label != resolved:
            return keep(f"{html.escape(label, quote=False)}：{html.escape(resolved, quote=False)}")
        return keep(html.escape(label, quote=False))

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


def convert_to_png(src: Path, destination: Path) -> None:
    try:
        from PIL import Image

        with Image.open(src) as img:
            img.save(destination, "PNG")
    except ImportError:
        if shutil.which("sips") is None:
            raise RuntimeError(f"Cannot convert {src} to PNG: install Pillow or run on macOS with sips")
        subprocess.run(
            ["sips", "-s", "format", "png", str(src), "--out", str(destination)],
            check=True,
            capture_output=True,
        )


def resolve_image(src: str, repo: Path, output_dir: Path) -> str:
    path = repo / "static" / src.lstrip("/") if src.startswith("/img/") else repo / src
    if path.suffix.lower() == ".svg":
        png_2x = path.with_name(path.stem + "@2x.png")
        png = path.with_suffix(".png")
        path = png_2x if png_2x.exists() else png
    if not path.exists():
        raise FileNotFoundError(f"Article image not found: {path}")
    if path.suffix.lower() == ".webp":
        # WeChat material upload rejects WebP, and publisher skips body images
        # whose filename contains "cover" (they are assumed to be the thumb),
        # so the converted copy is a PNG named ...-hero.png.
        destination = output_dir / f"{path.stem.replace('cover', 'hero')}.png"
        convert_to_png(path, destination)
        return destination.name
    destination = output_dir / path.name
    shutil.copy2(path, destination)
    return destination.name


def split_blocks(body: str) -> list[str]:
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    return [block.strip() for block in re.split(r"\n\s*\n", body) if block.strip()]


def parse_markdown_table(block: str) -> tuple[list[str], list[list[str]]] | None:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    if len(lines) < 2 or not all(line.startswith("|") and line.endswith("|") for line in lines):
        return None

    def cells(line: str) -> list[str]:
        return [cell.strip() for cell in line[1:-1].split("|")]

    headers = cells(lines[0])
    separator = cells(lines[1])
    if len(headers) != len(separator) or not all(re.fullmatch(r":?-{3,}:?", cell) for cell in separator):
        return None

    rows = [cells(line) for line in lines[2:]]
    if any(len(row) != len(headers) for row in rows):
        return None
    return headers, rows


def render_post(
    source_path: Path,
    output_path: Path,
    public_url: str,
    repo: Path,
    link_map: dict[str, str] | None = None,
) -> tuple[str, str]:
    metadata, body = parse_front_matter(source_path.read_text(encoding="utf-8"))
    title = metadata.get("title", source_path.stem)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    parts: list[str] = []
    skip_references = False

    cover_src = metadata.get("image")
    if cover_src:
        local_src = resolve_image(cover_src, repo, output_path.parent)
        parts.append(
            '<p style="margin: 0 0 24px 0 !important; padding: 0 !important; '
            'text-align: center !important; text-indent: 0 !important;">'
            f'<img src="{html.escape(local_src, quote=True)}" alt="{html.escape(title, quote=True)}" '
            f'style="margin: 0 !important; padding: 0 !important; border: 1px solid {TOKENS["border"]} !important; '
            'border-radius: 8px !important; width: 100% !important; text-indent: 0 !important;"></p>'
        )

    for block in split_blocks(body):
        if block.startswith("## "):
            heading_text = block[3:].strip()
            if heading_text == "参考资料":
                skip_references = True
                continue
            if skip_references:
                continue
            heading = render_inline(heading_text, public_url, link_map=link_map)
            parts.append(
                '<p style="margin: 42px 0 18px 0 !important; padding: 0 0 9px 0 !important; '
                f'border-bottom: 1px solid {TOKENS["border"]} !important; color: {TOKENS["accent"]} !important; '
                'font-size: 23px !important; font-weight: 700 !important; line-height: 1.4 !important; '
                f'letter-spacing: -0.2px !important; text-align: left !important; text-indent: 0 !important;">{heading}</p>'
            )
            continue

        if block.startswith("### "):
            heading = render_inline(block[4:].strip(), public_url, link_map=link_map)
            parts.append(
                '<p style="margin: 30px 0 14px 0 !important; padding: 0 !important; '
                f'color: {TOKENS["ink"]} !important; font-size: 19px !important; font-weight: 700 !important; '
                'line-height: 1.5 !important; text-align: left !important; text-indent: 0 !important;">'
                f'{heading}</p>'
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

        table = parse_markdown_table(block)
        if table:
            headers, rows = table
            header_cells = "".join(
                '<td style="padding: 10px 8px !important; '
                f'border: 1px solid {TOKENS["border"]} !important; background-color: {TOKENS["soft"]} !important; '
                f'color: {TOKENS["ink"]} !important; font-size: 13px !important; font-weight: 700 !important; '
                'line-height: 1.55 !important; vertical-align: top !important; word-break: break-word !important; '
                f'text-align: left !important; text-indent: 0 !important;">{render_inline(cell, public_url, link_map=link_map)}</td>'
                for cell in headers
            )
            row_markup = []
            for row in rows:
                row_markup.append(
                    "<tr>" + "".join(
                        '<td style="padding: 10px 8px !important; '
                        f'border: 1px solid {TOKENS["border"]} !important; color: {TOKENS["body"]} !important; '
                        'font-size: 13px !important; font-weight: 400 !important; line-height: 1.6 !important; '
                        'vertical-align: top !important; word-break: break-word !important; text-align: left !important; '
                        f'text-indent: 0 !important;">{render_inline(cell, public_url, link_map=link_map)}</td>'
                        for cell in row
                    ) + "</tr>"
                )
            parts.append(
                '<table style="margin: 24px 0 28px 0 !important; padding: 0 !important; width: 100% !important; '
                f'border: 1px solid {TOKENS["border"]} !important; border-collapse: collapse !important; '
                'border-spacing: 0 !important; table-layout: auto !important; text-indent: 0 !important;">'
                f'<tr>{header_cells}</tr>{"".join(row_markup)}</table>'
            )
            continue

        if block.startswith("- "):
            for item in block.splitlines():
                item = re.sub(r"^-\s+", "", item.strip())
                parts.append(
                    '<p style="margin: 0 0 12px 0 !important; padding: 0 0 0 15px !important; '
                    f'border-left: 2px solid {TOKENS["border"]} !important; color: {TOKENS["muted"]} !important; '
                    'font-size: 14px !important; font-weight: 400 !important; line-height: 1.75 !important; '
                    f'text-align: left !important; text-indent: 0 !important;">{render_inline(item, public_url, expand_links=True, link_map=link_map)}</p>'
                )
            continue

        paragraph = " ".join(line.strip() for line in block.splitlines())
        parts.append(f'<p style="{BODY_STYLE}">{render_inline(paragraph, public_url, link_map=link_map)}</p>')

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
    parts.append(
        f'<p style="margin: 42px 0 18px 0 !important; padding: 18px 0 0 0 !important; {about_border} '
        f'color: {TOKENS["quiet"]} !important; font-size: 13px !important; font-weight: 600 !important; '
        'line-height: 1.5 !important; letter-spacing: 1px !important; text-align: left !important; '
        'text-indent: 0 !important;">推荐阅读</p>'
    )
    for recommended_title, recommended_path in RECOMMENDED_READING:
        recommended_url = (link_map or {}).get(recommended_path)
        if recommended_url and recommended_url.startswith("https://mp.weixin.qq.com/"):
            recommended_content = (
                f'<a href="{html.escape(recommended_url, quote=True)}" target="_blank" '
                f'style="{LINK_STYLE}">{html.escape(recommended_title)}</a>'
            )
        else:
            recommended_content = html.escape(recommended_title)
        parts.append(
            '<p style="margin: 0 0 12px 0 !important; padding: 0 !important; '
            f'{about_body}">{recommended_content}</p>'
        )
    parts.extend([
        f'<p style="margin: 42px 0 18px 0 !important; padding: 18px 0 0 0 !important; {about_border} '
        f'color: {TOKENS["quiet"]} !important; font-size: 13px !important; font-weight: 600 !important; '
        'line-height: 1.5 !important; letter-spacing: 1px !important; text-align: left !important; text-indent: 0 !important;">关于</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_heading}">CubeLoop</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_body}">原生支持异步的 Python Agent Harness 框架，专为高性能、高可读性及生产级持久化能力而设计。</p>',
        f'<p style="margin: 0 0 20px 0 !important; padding: 0 !important; {about_body}">https://cubeloop.dev</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_heading}">CubePlex</p>',
        f'<p style="margin: 0 0 6px 0 !important; padding: 0 !important; {about_body}">CubePlex 是为团队构建的企业级智能体平台。Agent 的 Skills、Memory、工具、自动化任务和整个工作现场都在 Workspace 里持久保存，任务可以交接，经验可以复用，交付物以版本化产物留存。</p>',
        f'<p style="margin: 0 !important; padding: 0 !important; {about_body}">https://github.com/cubeplexai/cubeplex</p>',
    ])

    rendered = "\n".join(parts) + "\n"
    output_path.write_text(rendered, encoding="utf-8")
    return title, metadata.get("description", "")


def main() -> None:
    import json

    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--url", required=True)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument(
        "--link-map",
        type=Path,
        help="Optional JSON file mapping article link URLs to replacement URLs; "
        "targets on https://mp.weixin.qq.com/ are kept as clickable <a> links",
    )
    args = parser.parse_args()
    link_map: dict[str, str] = {}
    if args.link_map:
        link_map = json.loads(args.link_map.read_text(encoding="utf-8"))
    title, description = render_post(args.source, args.output, args.url, args.repo, link_map)
    print(f"title={title}")
    print(f"description={description}")
    print(f"output={args.output}")


if __name__ == "__main__":
    main()
