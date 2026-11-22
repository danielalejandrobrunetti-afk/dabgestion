#!/usr/bin/env python3
"""Notify IndexNow of explicit, recently changed DAB URLs. Dry run by default."""
import argparse
import json
from pathlib import Path
import re
import urllib.error
import urllib.request
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
HOST = "dabgestion.com"
ENDPOINT = "https://api.indexnow.org/indexnow"
KEY_URL = "https://dabgestion.com/indexnow-key.txt"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("urls", nargs="+", help="Only URLs changed in the current publication")
    parser.add_argument("--submit", action="store_true", help="Verify the deployed key and notify IndexNow")
    args = parser.parse_args()
    urls = list(dict.fromkeys(args.urls))
    if len(urls) > 10000:
        parser.error("At most 10,000 URLs per batch")
    for url in urls:
        p = urlparse(url)
        if p.scheme != "https" or p.netloc != HOST or p.query or p.fragment:
            parser.error("Use clean HTTPS URLs on dabgestion.com")
    key = (ROOT / "indexnow-key.txt").read_text(encoding="utf-8").strip()
    if not re.fullmatch(r"[a-zA-Z0-9-]{8,128}", key):
        parser.error("Invalid IndexNow ownership key")
    if not args.submit:
        print(json.dumps({"dry_run": True, "url_count": len(urls), "urls": urls}, ensure_ascii=False))
        return
    with urllib.request.urlopen(KEY_URL, timeout=20) as response:
        if response.status != 200 or response.url != KEY_URL or response.read().decode("utf-8").strip() != key:
            raise SystemExit("The published ownership key does not match; no URLs submitted")
    payload = {"host": HOST, "key": key, "keyLocation": KEY_URL, "urlList": urls}
    request = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode("utf-8"),
                                     headers={"Content-Type": "application/json; charset=utf-8"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
    except urllib.error.HTTPError as error:
        print(json.dumps({"received": False, "http_status": error.code, "url_count": len(urls)}))
        raise SystemExit(1)
    print(json.dumps({"received": status in (200, 202), "http_status": status,
                      "key_validation_pending": status == 202, "url_count": len(urls),
                      "indexing_confirmed": False, "urls": urls}, ensure_ascii=False))


if __name__ == "__main__":
    main()
