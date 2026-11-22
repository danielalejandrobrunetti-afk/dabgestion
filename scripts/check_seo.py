#!/usr/bin/env python3
"""Check the site's actual URL graph using only Python's standard library."""
import argparse
import concurrent.futures
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.request
from urllib.parse import unquote, urljoin, urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://dabgestion.com"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.canonicals, self.links, self.ids, self.json_blocks = [], [], set(), []
        self.robots, self.refresh, self.h1s, self.analytics = "", None, 0, 0
        self.in_json = False
        self.json_text = ""
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        if tag == "h1":
            self.h1s += 1
        if tag == "link" and "canonical" in a.get("rel", "").split():
            self.canonicals.append(a.get("href"))
        if tag == "meta":
            if a.get("name", "").lower() == "robots":
                self.robots = a.get("content", "").lower()
            if a.get("http-equiv", "").lower() == "refresh":
                self.refresh = a.get("content", "")
        for attr in ("href", "src"):
            if a.get(attr):
                self.links.append((tag, a[attr]))
        if tag == "script":
            if urlparse(a.get("src", "")).path == "/analytics.js":
                self.analytics += 1
            self.in_json = a.get("type") == "application/ld+json"
            self.json_text = ""

    def handle_data(self, data):
        if self.in_json:
            self.json_text += data

    def handle_endtag(self, tag):
        if tag == "script" and self.in_json:
            self.json_blocks.append(self.json_text)
            self.in_json = False


def page_url(path):
    relative = path.relative_to(ROOT)
    if relative.name == "index.html":
        parent = relative.parent.as_posix()
        return BASE + ("/" if parent == "." else "/" + parent + "/")
    return BASE + "/" + relative.as_posix()


def check(live=False):
    pages = {p.resolve(): Page(p) for p in ROOT.rglob("*.html") if ".git" not in p.parts}
    sitemap = [x.text for x in ET.parse(ROOT / "sitemap.xml").iter() if x.tag.endswith("}loc")]
    errors, indexable, redirects = [], [], 0
    for path, page in pages.items():
        url = page_url(path)
        label = str(path.relative_to(ROOT))
        if page.refresh is not None:
            redirects += 1
            target = re.fullmatch(r"0;\s*url=([^\s]+)", page.refresh)
            target_url = urljoin(url, target.group(1)) if target else None
            if not target or page.canonicals != [target_url] or target_url == url:
                errors.append(f"{label}: inconsistent redirect and canonical")
        elif "noindex" not in page.robots:
            indexable.append(url)
            if page.canonicals != [url]:
                errors.append(f"{label}: expected one self canonical")
            if page.h1s != 1:
                errors.append(f"{label}: expected one h1, got {page.h1s}")
            if page.analytics != 1:
                errors.append(f"{label}: expected one analytics script")
        for block in page.json_blocks:
            try:
                json.loads(block)
            except ValueError as error:
                errors.append(f"{label}: invalid JSON-LD: {error}")
        for tag, href in page.links:
            parsed = urlparse(urljoin(url, href))
            if parsed.scheme not in ("http", "https") or parsed.netloc != "dabgestion.com":
                continue
            destination = ROOT / unquote(parsed.path.lstrip("/"))
            if destination.is_dir():
                destination /= "index.html"
            if not destination.is_file():
                errors.append(f"{label}: missing {href}")
            elif tag == "a" and parsed.fragment and destination.resolve() in pages:
                if unquote(parsed.fragment) not in pages[destination.resolve()].ids:
                    errors.append(f"{label}: missing fragment {href}")
    if len(sitemap) != len(set(sitemap)):
        errors.append("sitemap: repeated URL")
    for url in set(sitemap) ^ set(indexable):
        errors.append(f"sitemap/indexable mismatch: {url}")
    live_ok = None
    if live:
        def fetch(url):
            try:
                with urllib.request.urlopen(url, timeout=20) as response:
                    return url, response.status == 200 and response.url == url
            except (urllib.error.URLError, TimeoutError):
                return url, False
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            checks = list(pool.map(fetch, sitemap))
        live_ok = sum(ok for _, ok in checks)
        errors.extend(f"live sitemap URL failed: {url}" for url, ok in checks if not ok)
    return {"html_files": len(pages), "canonical_pages": len(indexable), "legacy_routes": redirects,
            "sitemap_urls": len(sitemap), "live_ok": live_ok, "errors": errors}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Also check sitemap URLs over HTTPS")
    args = parser.parse_args()
    result = check(args.live)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result["errors"]))
