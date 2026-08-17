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

assert_file_contains() {
  local file="$1" expected="$2" label="$3"
  if ! grep -Fq -- "$expected" "$file"; then
    echo "FAIL: $label missing expected text '$expected'" >&2
    exit 1
  fi
}

assert_file_not_contains() {
  local file="$1" unexpected="$2" label="$3"
  if grep -Fq -- "$unexpected" "$file"; then
    echo "FAIL: $label unexpectedly contains '$unexpected'" >&2
    exit 1
  fi
}

assert_html_contract() {
  local path="$1" canonical="$2" output="$3"
  fetch_with_retry "$BASE$path" "$output" "$output.headers"
  assert_file_contains "$output" "rel=\"canonical\" href=\"$canonical\"" "$path canonical"
}

echo "Checking sitemap response"
fetch_with_retry "$BASE/sitemap.xml" "$TMP/sitemap.xml" "$TMP/sitemap.headers"
SITEMAP_TYPE="$(header_value Content-Type "$TMP/sitemap.headers")"
if [[ "$SITEMAP_TYPE" != application/xml* && "$SITEMAP_TYPE" != text/xml* ]]; then
  echo "FAIL: sitemap Content-Type is '$SITEMAP_TYPE'" >&2
  exit 1
fi
assert_file_contains "$TMP/sitemap.xml" '<urlset' 'sitemap body'

echo "Checking robots response"
fetch_with_retry "$BASE/robots.txt" "$TMP/robots.txt" "$TMP/robots.headers"
ROBOTS_TYPE="$(header_value Content-Type "$TMP/robots.headers")"
assert_contains "$ROBOTS_TYPE" 'text/plain' 'robots Content-Type'
assert_file_contains "$TMP/robots.txt" "Sitemap: $BASE/sitemap.xml" 'robots sitemap declaration'

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

assert_file_contains "$TMP/sitemap.xml" "<loc>$BASE/western-astrology.html</loc>" 'representative science sitemap entry'
assert_file_not_contains "$TMP/sitemap.xml" "<loc>$BASE/profile.html</loc>" 'profile noindex sitemap exclusion'
assert_file_not_contains "$TMP/sitemap.xml" "<loc>$BASE/dream-result.html</loc>" 'dream result noindex sitemap exclusion'

echo "Checking deployed Home semantic contract"
assert_html_contract "/" "$BASE/" "$TMP/home.html"
assert_file_contains "$TMP/home.html" "property=\"og:url\" content=\"$BASE/\"" 'Home og:url'
assert_file_contains "$TMP/home.html" "property=\"og:image\" content=\"$BASE/og-image.png\"" 'Home og:image'
assert_file_contains "$TMP/home.html" 'data-sorathai-launch-schema="1"' 'Home launch schema marker'

echo "Checking representative public science semantic contract"
assert_html_contract "/western-astrology.html" "$BASE/western-astrology.html" "$TMP/western.html"
assert_file_contains "$TMP/western.html" "property=\"og:url\" content=\"$BASE/western-astrology.html\"" 'Western og:url'
assert_file_contains "$TMP/western.html" "property=\"og:image\" content=\"$BASE/og-image.png\"" 'Western og:image'
assert_file_contains "$TMP/western.html" 'data-sorathai-launch-schema="1"' 'Western launch schema marker'
assert_file_not_contains "$TMP/western.html" 'name="robots" content="noindex' 'Western public indexability'

echo "Checking noindex shell semantic contracts"
assert_html_contract "/profile.html" "$BASE/profile.html" "$TMP/profile.html"
assert_file_contains "$TMP/profile.html" 'name="robots" content="noindex,follow"' 'Combined Profile robots'
assert_html_contract "/dream-result.html" "$BASE/dream-result.html" "$TMP/dream-result.html"
assert_file_contains "$TMP/dream-result.html" 'name="robots" content="noindex,follow"' 'Dream result robots'

echo "Checking social preview asset"
fetch_with_retry "$BASE/og-image.png" "$TMP/og-image.png" "$TMP/og-image.headers"
OG_TYPE="$(header_value Content-Type "$TMP/og-image.headers")"
assert_contains "$OG_TYPE" 'image/png' 'og-image Content-Type'
if [[ ! -s "$TMP/og-image.png" ]]; then
  echo "FAIL: og-image.png response is empty" >&2
  exit 1
fi

echo "Production crawler + semantic smoke passed for ${#URLS[@]} sitemap routes."
