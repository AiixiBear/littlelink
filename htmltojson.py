#!/usr/bin/env python3
"""
html_to_links.py
用法：python html_to_links.py index.html
      python html_to_links.py index.html -o links.json --inject
"""

import json
import sys
import argparse
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

SKIP_SCHEMES = {"javascript", "tel", "data", "mailto"}


class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []

        self._current_section = None
        self._in_h2 = False
        self._in_anchor = False
        self._current_href = None
        self._current_title_attr = ""
        self._current_text = []
        self._h2_text = []
        self._seen_urls = set()

    def _get_or_create_section(self, name):
        if not self.sections or self.sections[-1]["section"] != name:
            self.sections.append({"section": name, "links": []})
        return self.sections[-1]

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "h2":
            self._in_h2 = True
            self._h2_text = []

        elif tag == "a":
            href = attrs_dict.get("href", "").strip()
            self._current_href = href
            self._current_title_attr = attrs_dict.get("title") or attrs_dict.get("aria-label") or ""
            self._in_anchor = True
            self._current_text = []

    def handle_endtag(self, tag):
        if tag == "h2" and self._in_h2:
            self._in_h2 = False
            text = " ".join("".join(self._h2_text).split()).strip()
            if text:
                self._current_section = text

        elif tag == "a" and self._in_anchor:
            href = self._current_href or ""
            text = " ".join("".join(self._current_text).split()).strip()
            title = text or self._current_title_attr or href

            self._in_anchor = False
            self._current_href = None
            self._current_text = []

            if not href or href.startswith("#"):
                return
            
            if href.lower().startswith("javascript:"):
                return

            parsed = urlparse(href)
            if parsed.scheme in SKIP_SCHEMES:
                return
            
            if href in self._seen_urls:
                return

            if "JSON" in title:
                return

            self._seen_urls.add(href)

            section_name = self._current_section or "未分類"
            section = self._get_or_create_section(section_name)
            section["links"].append({"title": title, "url": href})

    def handle_data(self, data):
        if self._in_h2 and not self._in_anchor:
            self._h2_text.append(data)
        if self._in_anchor:
            self._current_text.append(data)


def generate_profile_schema(sections, site_url, author_name):
    """
    根據提取的連結生成 ProfilePage Schema
    """
    same_as_links = []
    for section in sections:
        for link in section["links"]:
            same_as_links.append(link["url"])

    schema = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "url": site_url,
        "mainEntity": {
            "@type": "Person",
            "name": author_name,
            "sameAs": same_as_links
        }
    }
    return schema


def remove_existing_schema(html_content):
    """
    自動尋找並移除 HTML 中殘留的 ProfilePage Schema 標籤
    """
    # 匹配包含 "ProfilePage" 的 <script type="application/ld+json">...</script> 區塊
    pattern = r'<script\s+type=["\']application/ld\+json["\']\s*>[^<]*?"@type"\s*:\s*["\']ProfilePage["\'][^<]*?</script>\s*'
    # 使用正則表達式將其替換為空字串（忽略大小寫與換行）
    cleaned_html = re.sub(pattern, '', html_content, flags=re.DOTALL | re.IGNORECASE)
    return cleaned_html


def inject_schema_to_html(html_content, schema_dict):
    """
    將 Schema JSON-LD 注入到 HTML 的 </head> 標籤前
    """
    # 先清理掉舊的殘留 Schema
    cleaned_html = remove_existing_schema(html_content)
    
    schema_json = json.dumps(schema_dict, ensure_ascii=False, indent=2)
    schema_script = f"\n<script type=\"application/ld+json\">\n{schema_json}\n</script>\n"
    
    if "</head>" in cleaned_html:
        return cleaned_html.replace("</head>", f"{schema_script}</head>", 1)
    elif "<body>" in cleaned_html:
        return cleaned_html.replace("<body>", f"<body>{schema_script}", 1)
    else:
        return cleaned_html + schema_script


def main():
    parser = argparse.ArgumentParser(description="把 LittleLink HTML 的連結轉成 links.json 並可選注入 ProfilePage Schema")
    parser.add_argument("input", help="輸入的 HTML 檔案路徑（例如 index.html）")
    parser.add_argument("-o", "--output", default="links.json", help="輸出的 JSON 檔案路徑（預設：links.json）")
    parser.add_argument("--flat", action="store_true", help="不分區塊，輸出為扁平陣列")
    parser.add_argument("--inject", action="store_true", help="是否將 ProfilePage Schema 注入回原 HTML 檔案")
    parser.add_argument("--url", default="https://go.aiixi.cc/", help="個人的主頁網址 (Schema 所需)")
    parser.add_argument("--name", default="Aiixi Bear", help="個人名稱 (Schema 所需)")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"錯誤：找不到檔案 {args.input}", file=sys.stderr)
        sys.exit(1)

    html = input_path.read_text(encoding="utf-8", errors="replace")

    extractor = LinkExtractor()
    extractor.feed(html)
    sections = [s for s in extractor.sections if s["links"]]

    if args.flat:
        output_data = [link for s in sections for link in s["links"]]
    else:
        output_data = sections

    # 輸出原本的 JSON 檔案
    output_path = Path(args.output)
    output_path.write_text(
        json.dumps(output_data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    # 處理 Schema 生成與注入
    schema_dict = generate_profile_schema(sections, args.url, args.name)
    
    if args.inject:
        updated_html = inject_schema_to_html(html, schema_dict)
        input_path.write_text(updated_html, encoding="utf-8")
        print(f"已成功清理舊資料並將新的 ProfilePage Schema 注入至 {input_path}")

    total = sum(len(s["links"]) for s in sections)
    print(f"完成！共 {len(sections)} 個區塊，{total} 個連結 → {output_path}")


if __name__ == "__main__":
    main()