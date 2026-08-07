#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微信公众号草稿发布工具
支持上传封面图片、创建草稿文章
"""

import os
import sys
import json
import time
import requests
import argparse
import mimetypes
from pathlib import Path
from typing import Optional, Dict, Any

# 动态获取 skill 根目录（向上两级：scripts/ -> wechat-publisher/）
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(SCRIPT_DIR)


class WeChatPublisher:
    """微信公众号草稿发布器"""

    BASE_URL = "https://api.weixin.qq.com/cgi-bin"
    TOKEN_CACHE_FILE = os.path.join(SKILL_ROOT, "token_cache.json")
    CONFIG_FILE = os.path.join(SKILL_ROOT, "config.json")

    # 微信API错误码映射
    ERROR_CODES = {
        40001: "AppSecret错误或者AppSecret不属于这个AppID",
        40002: "请确保grant_type字段值为client_credential",
        40013: "不合法的AppID，请检查AppID是否正确",
        40125: "无效的appsecret，请检查AppSecret是否正确",
        40164: "调用接口的IP地址不在白名单中",
        41001: "缺少access_token参数",
        42001: "access_token超时，请检查缓存是否正常",
        45009: "接口调用超过限制（每日API调用量已用完）",
        47003: "参数错误，请检查必填字段是否完整",
        48001: "api功能未授权，请确认公众号类型",
        50005: "用户未关注公众号",
        -1: "系统繁忙，请稍后重试"
    }

    def __init__(self):
        """初始化发布器"""
        self.appid = None
        self.appsecret = None
        self.author = None
        self.access_token = None
        self.load_config()

    def load_config(self):
        """加载配置文件，首次运行时启动配置向导"""
        if not os.path.exists(self.CONFIG_FILE):
            print("=" * 60)
            print("  欢迎使用微信公众号草稿发布工具！")
            print("=" * 60)
            print("\n首次使用需要配置微信公众号凭证。")
            print("\n获取方式：")
            print("  1. 登录 https://mp.weixin.qq.com")
            print("  2. 设置与开发 → 基本配置")
            print("  3. 复制AppID和AppSecret\n")

            should_setup = input("是否现在配置？(Y/n): ").strip().lower()
            if should_setup in ['', 'y', 'yes']:
                self._interactive_setup()
            else:
                raise FileNotFoundError(
                    f"请手动创建配置文件: {self.CONFIG_FILE}\n"
                    f"格式: {{'appid': 'your_appid', 'appsecret': 'your_appsecret'}}"
                )

        # 验证配置文件格式
        try:
            with open(self.CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"配置文件格式错误: {e}\n请检查JSON格式是否正确")

        # 验证必需字段
        self.appid = config.get('appid', '').strip()
        self.appsecret = config.get('appsecret', '').strip()
        self.author = config.get('author', '').strip()

        if not self.appid or self.appid in ['your_appid_here', 'your_appid']:
            raise ValueError(f"请在配置文件中填写有效的appid\n配置文件: {self.CONFIG_FILE}")
        if not self.appsecret or self.appsecret in ['your_appsecret_here', 'your_appsecret']:
            raise ValueError(f"请在配置文件中填写有效的appsecret\n配置文件: {self.CONFIG_FILE}")

        # author 是可选字段，如果未设置给出提示
        if not self.author or self.author in ['Your Name', 'your_name_here']:
            print("⚠ 提示: 未配置作者名，将使用空值或调用时指定的作者名")
            self.author = ""

        # 验证格式
        if not self.appid.startswith('wx') or len(self.appid) != 18:
            print("⚠ 警告: AppID格式可能不正确（应为wx开头的18位字符）")

        author_info = f", 作者: {self.author}" if self.author else ""
        print(f"✓ 配置加载成功 (AppID: {self.appid[:6]}***{author_info})")

    def _interactive_setup(self):
        """交互式配置向导"""
        print("\n请输入微信公众号凭证：")
        appid = input("AppID (wx开头): ").strip()
        appsecret = input("AppSecret: ").strip()
        author = input("作者名 (可选，留空则每次发布时可指定): ").strip()

        # 简单验证
        if not appid.startswith('wx'):
            print("⚠ 警告: AppID通常以wx开头")

        # 创建配置目录和文件
        os.makedirs(os.path.dirname(self.CONFIG_FILE), exist_ok=True)
        config_data = {
            "appid": appid,
            "appsecret": appsecret,
            "author": author if author else ""
        }

        with open(self.CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)

        os.chmod(self.CONFIG_FILE, 0o600)
        print(f"\n✓ 配置已保存到: {self.CONFIG_FILE}")
        print("  (已设置权限为600，仅当前用户可读写)")

        self.appid = appid
        self.appsecret = appsecret
        self.author = author

    def _get_public_ip(self) -> str:
        """
        获取当前机器的公网 IP 地址（微信 API 看到的真实 IP）

        优先使用国内 IP 检测服务，因为它们和微信 API 走相同的路由。
        如果用户使用代理/VPN 且有分流规则，国外服务可能返回代理出口 IP，
        而国内服务和微信 API 一样走直连，返回真实 IP。

        Returns:
            公网 IP 地址字符串，获取失败则返回 "无法获取"
        """
        import re

        # 优先使用国内服务（和微信 API 走相同路由）
        # 然后是国外服务作为备用
        services = [
            ('https://myip.ipip.net', 'cn'),      # 国内，返回格式: "当前 IP：x.x.x.x  来自于：..."
            ('https://api-ipv4.ip.sb/ip', 'intl'), # 有国内节点
            ('https://api.ipify.org', 'intl'),
            ('https://ifconfig.me/ip', 'intl'),
        ]

        for url, region in services:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    text = response.text.strip()

                    # ipip.net 返回格式特殊，需要提取 IP
                    if 'ipip.net' in url:
                        match = re.search(r'(\d+\.\d+\.\d+\.\d+)', text)
                        if match:
                            return match.group(1)
                    else:
                        # 其他服务直接返回 IP
                        if text and '.' in text and len(text) <= 15:
                            return text
            except Exception:
                continue

        return "无法获取"

    def _handle_api_error(self, errcode: int, errmsg: str, context: str = "") -> str:
        """统一处理API错误，返回友好的中文提示"""
        chinese_msg = self.ERROR_CODES.get(errcode, errmsg)
        error_detail = f"{context}失败 (错误码{errcode}): {chinese_msg}"

        # 提供针对性的解决建议
        if errcode == 40164:
            error_detail += "\n\n💡 解决方法："
            error_detail += "\n  1. 登录微信公众平台 https://mp.weixin.qq.com"
            error_detail += "\n  2. 设置与开发 → 基本配置 → IP白名单"
            error_detail += "\n  3. 添加以下公网IP到白名单"

            # 获取真实的公网 IP（微信看到的 IP）
            print("\n→ 正在检测公网IP...")
            public_ip = self._get_public_ip()

            if public_ip != "无法获取":
                error_detail += f"\n\n  需要添加到白名单的IP: {public_ip}"
                error_detail += "\n  （这是微信服务器看到的您的真实公网IP）"
            else:
                error_detail += "\n\n  无法自动检测公网IP，请手动查询："
                error_detail += "\n  - 访问 https://ipinfo.io 查看您的公网IP"
                error_detail += "\n  - 或访问 https://ifconfig.me"

        elif errcode in [40001, 40125, 40013]:
            error_detail += "\n\n💡 解决方法："
            error_detail += "\n  1. 检查配置文件中的AppID和AppSecret是否正确"
            error_detail += f"\n  2. 配置文件位置: {self.CONFIG_FILE}"
            error_detail += "\n  3. AppID应该以wx开头，长度18位"

        elif errcode == 45009:
            error_detail += "\n\n💡 解决方法："
            error_detail += "\n  API调用次数已达上限，请明天再试"
            error_detail += "\n  或联系微信公众平台提升配额"

        return error_detail

    def get_access_token(self, force_refresh: bool = False) -> str:
        """
        获取access_token，优先使用缓存

        Args:
            force_refresh: 是否强制刷新token

        Returns:
            access_token字符串
        """
        # 尝试从缓存读取
        if not force_refresh and os.path.exists(self.TOKEN_CACHE_FILE):
            try:
                with open(self.TOKEN_CACHE_FILE, 'r') as f:
                    cache = json.load(f)

                # 检查token是否过期（提前5分钟刷新）
                if time.time() < cache.get('expires_at', 0) - 300:
                    print("✓ 使用缓存的access_token")
                    return cache['access_token']
            except Exception as e:
                print(f"⚠ 读取token缓存失败: {e}")

        # 请求新的token
        print("→ 正在获取新的access_token...")
        url = f"{self.BASE_URL}/token"
        params = {
            'grant_type': 'client_credential',
            'appid': self.appid,
            'secret': self.appsecret
        }

        response = requests.get(url, params=params)
        result = response.json()

        if 'errcode' in result:
            error_msg = self._handle_api_error(
                result['errcode'],
                result.get('errmsg', 'Unknown error'),
                context="获取access_token"
            )
            raise Exception(error_msg)

        access_token = result['access_token']
        expires_in = result.get('expires_in', 7200)

        # 缓存token
        os.makedirs(os.path.dirname(self.TOKEN_CACHE_FILE), exist_ok=True)
        cache_data = {
            'access_token': access_token,
            'expires_at': time.time() + expires_in,
            'updated_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        with open(self.TOKEN_CACHE_FILE, 'w') as f:
            json.dump(cache_data, f, indent=2)

        print(f"✓ 获取access_token成功 (有效期: {expires_in}秒)")
        return access_token

    def upload_image(self, image_path: str, return_url: bool = False):
        """
        上传图片到微信服务器

        Args:
            image_path: 图片文件路径
            return_url: 是否返回图片URL（用于内容图片）

        Returns:
            media_id 或 (media_id, url) 元组
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片文件不存在: {image_path}")

        print(f"→ 正在上传图片: {os.path.basename(image_path)}")

        token = self.get_access_token()
        url = f"{self.BASE_URL}/material/add_material"

        params = {
            'access_token': token,
            'type': 'image'
        }

        with open(image_path, 'rb') as f:
            mime_type = mimetypes.guess_type(image_path)[0] or 'application/octet-stream'
            files = {'media': (os.path.basename(image_path), f, mime_type)}
            response = requests.post(url, params=params, files=files)

        result = response.json()

        if 'errcode' in result and result['errcode'] != 0:
            error_msg = self._handle_api_error(
                result['errcode'],
                result.get('errmsg', 'Unknown error'),
                context="上传图片"
            )
            raise Exception(error_msg)

        media_id = result.get('media_id')
        image_url = result.get('url', '')
        print(f"✓ 图片上传成功 (media_id: {media_id})")

        if return_url:
            return media_id, image_url
        return media_id

    def _remove_cover_image(self, content: str) -> str:
        """
        移除HTML中的封面图片

        移除策略：
        1. 移除 <img src="cover.png"> 及其变体
        2. 移除第一个出现的 <img> 标签（通常是封面图）
        3. 保留注释中的封面图引用说明

        Args:
            content: HTML内容

        Returns:
            移除封面图后的HTML内容
        """
        import re

        # 策略1: 移除明确的封面图引用（cover.png, cover.jpg, 封面图等）
        cover_patterns = [
            r'<img[^>]*src=["\']cover\.(png|jpg|jpeg|gif)["\'][^>]*>',  # cover.png
            r'<img[^>]*alt=["\'][^"\']*封面[^"\']*["\'][^>]*>',  # alt包含"封面"
            r'<img[^>]*title=["\'][^"\']*封面[^"\']*["\'][^>]*>',  # title包含"封面"
        ]

        for pattern in cover_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)

        # 策略2: 移除注释后的第一张图片（通常是封面图位置）
        # 匹配：<!-- 注释 --> 后紧跟的 <img> 标签
        content = re.sub(
            r'(<!--[^>]*标题[^>]*-->)\s*<img[^>]*>',
            r'\1',
            content,
            count=1,
            flags=re.IGNORECASE
        )

        return content

    def _upload_content_images(self, content: str, base_dir: str = ".") -> str:
        """
        扫描HTML中的本地图片并上传到微信，替换为微信URL

        Args:
            content: HTML内容
            base_dir: 图片所在的基础目录

        Returns:
            替换后的HTML内容
        """
        import re
        from pathlib import Path

        # 正则匹配所有 <img src="本地路径"> 标签
        img_pattern = r'<img([^>]*?)src=["\']([^"\']+)["\']([^>]*?)>'

        uploaded_count = 0

        def replace_image(match):
            nonlocal uploaded_count
            before_src = match.group(1)
            src = match.group(2)
            after_src = match.group(3)

            # 跳过已经是HTTP/HTTPS的图片
            if src.startswith(('http://', 'https://')):
                return match.group(0)

            # 跳过封面图（已单独处理）
            if 'cover' in src.lower():
                return match.group(0)

            # 构建完整路径
            image_path = Path(base_dir) / src

            if not image_path.exists():
                print(f"  ⚠️ 图片不存在，跳过: {src}")
                return match.group(0)

            try:
                # 上传图片并获取URL
                _, wechat_url = self.upload_image(str(image_path), return_url=True)

                if wechat_url:
                    uploaded_count += 1
                    # 替换为微信URL
                    return f'<img{before_src}src="{wechat_url}"{after_src}>'
                else:
                    print(f"  ⚠️ 未获取到URL，保持原路径: {src}")
                    return match.group(0)

            except Exception as e:
                print(f"  ⚠️ 上传图片失败 {src}: {e}")
                return match.group(0)

        # 执行替换
        content = re.sub(img_pattern, replace_image, content)

        if uploaded_count > 0:
            print(f"  ✓ 成功上传 {uploaded_count} 张内容图片")

        return content

    def _fix_wechat_editor_issues(self, content: str) -> str:
        """
        轻量修复微信编辑器兼容性问题

        解决的问题：
        1. 删除标签间空白 → 防止莫名空行
        2. 确保所有样式有 !important → 防止微信覆盖样式
        3. 强制禁用缩进 → 微信默认 2em 缩进
        4. 移除不支持样式 → box-shadow, text-shadow, transform, transition

        Args:
            content: HTML内容

        Returns:
            修复后的HTML内容
        """
        import re

        # === 1. 删除所有标签间空白（防止莫名空行）===
        content = re.sub(r'>\s+<', '><', content)

        # === 2. 确保所有样式有 !important ===
        # 匹配 CSS 属性并添加 !important（如果还没有）
        def add_important(match):
            prop = match.group(1)  # 属性名:值
            if '!important' in prop:
                return prop + ';'
            return prop + ' !important;'

        # 匹配所有 CSS 声明
        content = re.sub(
            r'([a-z-]+:\s*[^;]+);',
            add_important,
            content
        )

        # === 3. 强制禁用缩进 ===
        # 给所有 style 属性添加 text-indent: 0
        content = re.sub(
            r'style="(?![^"]*text-indent)([^"]*)"',
            r'style="\1 text-indent: 0 !important;"',
            content
        )

        # === 4. 移除微信不支持的样式 ===
        content = re.sub(r'box-shadow:[^;]+;?\s*', '', content)
        content = re.sub(r'text-shadow:[^;]+;?\s*', '', content)
        content = re.sub(r'transform:[^;]+;?\s*', '', content)
        content = re.sub(r'transition:[^;]+;?\s*', '', content)

        print("  ✓ 完成轻量修复（空白、!important、缩进、不支持样式）")

        return content

    def create_draft(self,
                    title: str,
                    content: str,
                    author: str = None,
                    thumb_media_id: str = "",
                    digest: str = "",
                    show_cover_pic: int = 1,
                    content_base_dir: str = ".") -> Dict[str, Any]:
        """
        创建草稿文章

        Args:
            title: 文章标题
            content: 文章内容（HTML格式）
            author: 作者
            thumb_media_id: 封面图片的media_id
            digest: 摘要
            show_cover_pic: 是否显示封面，1显示，0不显示
            content_base_dir: 内容图片所在目录（默认当前目录）

        Returns:
            创建结果
        """
        # 0. 如果没有封面图，使用默认黑色封面
        if not thumb_media_id:
            default_cover = os.path.join(SKILL_ROOT, "assets", "default_cover.png")
            if os.path.exists(default_cover):
                print("→ 未提供封面，使用默认黑色封面")
                thumb_media_id = self.upload_image(default_cover)
            else:
                print("⚠ 警告：未找到默认封面图，草稿将无封面")

        # 1. 自动移除封面图片（封面已通过API单独上传）
        content = self._remove_cover_image(content)

        # 2. 上传内容中的其他图片并替换为微信URL
        print("\n→ 正在处理内容中的图片...")
        content = self._upload_content_images(content, content_base_dir)

        # 3. 修复微信编辑器的样式破坏问题
        content = self._fix_wechat_editor_issues(content)
        print("✓ 已优化HTML格式（防止编辑模式样式错位）")

        # 微信字段长度限制
        MAX_AUTHOR_BYTES = 20      # 作者名20字节
        MAX_DIGEST_BYTES = 120     # 摘要120字节
        MAX_TITLE_CHARS = 64       # 标题64字符（微信官方限制）
        MAX_TITLE_BYTES = 192      # 标题最大字节数（64汉字×3字节）

        # 自动截断超长字段（按字节）
        def truncate_by_bytes(text, max_bytes):
            """按字节截断文本"""
            encoded = text.encode('utf-8')
            if len(encoded) <= max_bytes:
                return text
            # 逐字符截断直到字节数符合要求
            for i in range(len(text), 0, -1):
                truncated = text[:i]
                if len(truncated.encode('utf-8')) <= max_bytes:
                    return truncated
            return ""

        original_title = title
        title_chars = len(title)
        title_bytes = len(title.encode('utf-8'))

        # 优先按字符数检查（微信官方限制是64字符）
        if title_chars > MAX_TITLE_CHARS:
            print(f"\n⚠️  标题过长警告")
            print(f"原标题: {original_title}")
            print(f"长度: {title_chars} 字符（限制: {MAX_TITLE_CHARS} 字符）")

            # 按字符数截断
            title = title[:MAX_TITLE_CHARS]
            print(f"已截断为: {title}")
            print(f"\n提示: 您可以在微信编辑器中手动修改为完整标题\n")
        # 备用检查：如果字节数超过192（极端情况）
        elif title_bytes > MAX_TITLE_BYTES:
            print(f"\n⚠️  标题字节数过长")
            print(f"原标题: {original_title}")
            print(f"字节数: {title_bytes} 字节（限制: {MAX_TITLE_BYTES} 字节）")

            # 按字节截断
            title = truncate_by_bytes(title, MAX_TITLE_BYTES)
            print(f"已截断为: {title}")
            print(f"\n提示: 您可以在微信编辑器中手动修改为完整标题\n")

        print(f"→ 正在创建草稿: {title}")

        # 如果没有传入 author，使用配置的 author
        if author is None:
            author = self.author

        if author:
            original_author = author
            author = truncate_by_bytes(author, MAX_AUTHOR_BYTES)
            if author != original_author:
                print(f"⚠ 作者名超长，已自动截断：{original_author} → {author}")

        if not digest:
            digest = truncate_by_bytes(title, 54)  # 使用标题（最多54字节）作为摘要

        original_digest = digest
        digest = truncate_by_bytes(digest, MAX_DIGEST_BYTES)
        if digest != original_digest:
            print(f"⚠ 摘要超长，已自动截断")

        token = self.get_access_token()
        url = f"{self.BASE_URL}/draft/add?access_token={token}"

        # 构建文章数据
        articles = {
            "articles": [{
                "title": title,
                "author": author,
                "digest": digest,
                "content": content,
                "content_source_url": "",
                "thumb_media_id": thumb_media_id,
                "show_cover_pic": show_cover_pic,
                "need_open_comment": 0,
                "only_fans_can_comment": 0
            }]
        }

        headers = {'Content-Type': 'application/json; charset=utf-8'}
        # 手动序列化JSON，确保中文不被转义
        data = json.dumps(articles, ensure_ascii=False).encode('utf-8')
        response = requests.post(url, data=data, headers=headers)
        result = response.json()

        if 'errcode' in result and result['errcode'] != 0:
            # 如果是token过期，尝试刷新token后重试
            if result['errcode'] in [40001, 42001]:
                print("⚠ access_token已过期，正在刷新...")
                self.access_token = self.get_access_token(force_refresh=True)
                token = self.access_token
                url = f"{self.BASE_URL}/draft/add?access_token={token}"
                data = json.dumps(articles, ensure_ascii=False).encode('utf-8')
                response = requests.post(url, data=data, headers=headers)
                result = response.json()

                if 'errcode' in result and result['errcode'] != 0:
                    error_msg = self._handle_api_error(
                        result['errcode'],
                        result.get('errmsg', 'Unknown error'),
                        context="创建草稿"
                    )
                    raise Exception(error_msg)
            else:
                error_msg = self._handle_api_error(
                    result['errcode'],
                    result.get('errmsg', 'Unknown error'),
                    context="创建草稿"
                )
                raise Exception(error_msg)

        print(f"✓ 草稿创建成功!")
        print(f"  media_id: {result.get('media_id')}")

        return result


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='微信公众号草稿发布工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  %(prog)s --title "文章标题" --content article.html
  %(prog)s --title "文章标题" --content article.html --cover cover.png --author "作者名"
  %(prog)s --interactive  # 交互式模式
        """
    )

    parser.add_argument('-t', '--title', help='文章标题')
    parser.add_argument('-c', '--content', help='文章内容文件路径（HTML格式）')
    parser.add_argument('-a', '--author', default='YanG', help='作者（默认: YanG）')
    parser.add_argument('--cover', default='cover.png', help='封面图片路径（默认: cover.png）')
    parser.add_argument('-d', '--digest', help='文章摘要')
    parser.add_argument('--interactive', action='store_true', help='交互式模式')

    args = parser.parse_args()

    try:
        publisher = WeChatPublisher()

        # 交互式模式
        if args.interactive:
            print("=== 微信公众号草稿发布工具（交互式） ===\n")
            title = input("请输入文章标题: ").strip()
            content_file = input("请输入内容文件路径 (HTML): ").strip()
            author = input("请输入作者 (可选): ").strip()
            cover = input("请输入封面图片路径 (可选): ").strip()
            digest = input("请输入摘要 (可选): ").strip()
        else:
            if not args.title or not args.content:
                parser.print_help()
                print("\n错误: 必须提供 --title 和 --content 参数")
                sys.exit(1)

            title = args.title
            content_file = args.content
            author = args.author
            cover = args.cover
            digest = args.digest

        # 读取内容文件
        if not os.path.exists(content_file):
            print(f"错误: 内容文件不存在: {content_file}")
            sys.exit(1)

        with open(content_file, 'r', encoding='utf-8') as f:
            content = f.read()

        print(f"\n{'='*50}")
        print(f"标题: {title}")
        print(f"作者: {author or '(未设置)'}")
        print(f"内容文件: {content_file} ({len(content)} 字符)")
        print(f"封面: {cover or '(无)'}")
        print(f"{'='*50}\n")

        # 上传封面（如果有）
        thumb_media_id = ""
        if cover and os.path.exists(cover):
            thumb_media_id = publisher.upload_image(cover)

        # 创建草稿
        result = publisher.create_draft(
            title=title,
            content=content,
            author=author,
            thumb_media_id=thumb_media_id,
            digest=digest,
            content_base_dir=os.path.dirname(os.path.abspath(content_file)) or "."
        )

        print(f"\n{'='*50}")
        print("✓ 发布成功！请前往微信公众号后台查看草稿")
        print(f"{'='*50}")

    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
