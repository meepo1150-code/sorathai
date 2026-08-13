#!/usr/bin/env bash
set -euo pipefail

BASE="https://sorathai.pages.dev"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fetch_with_retry() {
  local url="$1" output="$2" headers="$3"
  curl --fail --silent --show-error --location \
    --retry 8 --retry-delay 10 --retry-all-errors \
    --connect-timeout 10 --max-time 45 \
    --dump-header "$headers" --output "$output" "$url"
}

header_value() {
  local name="$1" file="$2"
  awk -v key="$name" 'BEGIN{IGNORECASE=1} $0 ~ "^" key ":" {sub(/^[^:]+:[[:space:]]*/, ""); gsub(/\r/, ""); value=$0} END{print value}' "$file"
}

assert_contains() {
  local value="$1" expected="$2" label="$3"
  if [[ "$value" != *"$expected"* ]]; then
    echo "FAIL: $label expected to contain '$expected', got '$value'" >&2
    exit 1
  fi
}

echo "Checking sitemap response"
fetch_with_retry "$BASE/sitemap.xml" "$TMP/sitemap.xml" "$TMP/sitemap.headers"
SITEMAP_TYPE="$(header_value Content-Type "$TMP/sitemap.headers")"
if [[ "$SITEMAP_TYPE" != application/xml* && "$SITEMAP_TYPE" != text/xml* ]]; then
  echo "FAIL: sitemap Content-Type is '$SITEMAP_TYPE'" >&2
  exit 1
fi
assert_contains "$(cat "$TMP/sitemap.xml")" '<urlset' 'sitemap body'

echo "Checking robots response"
fetch_with_retry "$BASE/robots.txt" "$TMP/robots.txt" "$TMP/robots.headers"
ROBOTS_TYPE="$(header_value Content-Type "$TMP/robots.headers")"
assert_contains "$ROBOTS_TYPE" 'text/plain' 'robots Content-Type'
assert_contains "$(cat "$TMP/robots.txt")" "Sitemap: $BASE/sitemap.xml" 'robots sitemap declaration'

echo "Checking every public URL declared in sitemap"
mapfile -t URLS < <(grep -oE '<loc>[^<]+</loc>' "$TMP/sitemap.xml" | sed -E 's#</?loc>##g')
if (( ${#URLS[@]} < 10 )); then
  echo "FAIL: unexpectedly small sitemap (${#URLS[@]} URLs)" >&2
  exit 1
fi

for url in "${URLS[@]}"; do
  if [[ "$url" != "$BASE"/* && "$url" != "$BASE/" ]]; then
    echo "FAIL: sitemap origin drift: $url" >&2
    exit 1
  fi
  code="$(curl --silent --show-error --location --retry 5 --retry-delay 5 --retry-all-errors --connect-timeout 10 --max-time 45 --output /dev/null --write-out '%{http_code}' "$url")"
  if [[ "$code" != "200" ]]; then
    echo "FAIL: $url returned HTTP $code" >&2
    exit 1
  fi
  echo "OK $code $url"
done

echo "Production crawler smoke passed for ${#URLS[@]} sitemap routes."
