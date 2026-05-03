#!/usr/bin/env python3
"""
html_to_links.py
用法：python html_to_links.py index.html
      python html_to_links.py index.html -o links.json

輸出格式：
[
  {
    "section": "我的網站",
    "links": [
      { "title": "看我的自我介紹點這裡", "url": "https://..." },
      ...
    ]
  },
  ...
]
"""

import json
import sys
import argparse
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

SKIP_SCHEMES = {"javascript", "mailto", "tel", "data"}


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
        self._p_text = []
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

            # 基本檢查：無效網址或錨點跳過
            if not href or href.startswith("#"):
                return
            
            parsed = urlparse(href)
            if parsed.scheme in SKIP_SCHEMES:
                return
            
            # 重複網址跳過
            if href in self._seen_urls:
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


def main():
    parser = argparse.ArgumentParser(description="把 LittleLink HTML 的連結（依區塊）轉成 links.json")
    parser.add_argument("input", help="輸入的 HTML 檔案路徑（例如 index.html）")
    parser.add_argument("-o", "--output", default="links.json", help="輸出的 JSON 檔案路徑（預設：links.json）")
    parser.add_argument("--flat", action="store_true", help="不分區塊，輸出為扁平陣列")
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

    output_path = Path(args.output)
    output_path.write_text(
        json.dumps(output_data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    total = sum(len(s["links"]) for s in sections)
    print(f"完成！共 {len(sections)} 個區塊，{total} 個連結 → {output_path}")
    for section in sections:
        print(f"\n  [{section['section']}]")
        for link in section["links"]:
            print(f"    - {link['title'][:40]:<40}  {link['url']}")


if __name__ == "__main__":
    main()