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

assert_header_file_contains_ci() {
  local file="$1" expected="$2" label="$3"
  if ! tr -d '\r' < "$file" | grep -Fiq -- "$expected"; then
    echo "FAIL: $label missing expected header fragment '$expected'" >&2
    exit 1
  fi
}

assert_header_file_not_contains_ci() {
  local file="$1" unexpected="$2" label="$3"
  if tr -d '\r' < "$file" | grep -Fiq -- "$unexpected"; then
    echo "FAIL: $label unexpectedly contains header fragment '$unexpected'" >&2
    exit 1
  fi
}

fetch_html_contract() {
  local path="$1" output="$2"
  fetch_with_retry "$BASE$path" "$output" "$output.headers"
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

index=0
for url in "${URLS[@]}"; do
  if [[ "$url" != "$BASE"/* && "$url" != "$BASE/" ]]; then
    echo "FAIL: sitemap origin drift: $url" >&2
    exit 1
  fi

  headers="$TMP/sitemap-route-$index.headers"
  body="$TMP/sitemap-route-$index.body"
  code="$(curl --silent --show-error --location --retry 5 --retry-delay 5 --retry-all-errors --connect-timeout 10 --max-time 45 --dump-header "$headers" --output "$body" --write-out '%{http_code}' "$url")"
  if [[ "$code" != "200" ]]; then
    echo "FAIL: $url returned HTTP $code" >&2
    exit 1
  fi

  assert_header_file_contains_ci "$headers" "Link: <$url>; rel=\"canonical\"" "$url canonical Link header"
  echo "OK $code $url canonical"
  index=$((index + 1))
done

assert_file_contains "$TMP/sitemap.xml" "<loc>$BASE/western-astrology.html</loc>" 'representative science sitemap entry'
assert_file_not_contains "$TMP/sitemap.xml" "<loc>$BASE/profile.html</loc>" 'profile noindex sitemap exclusion'
assert_file_not_contains "$TMP/sitemap.xml" "<loc>$BASE/dream-result.html</loc>" 'dream result noindex sitemap exclusion'

echo "Checking deployed Home semantic contract"
fetch_html_contract "/" "$TMP/home.html"
assert_file_contains "$TMP/home.html" "property=\"og:url\" content=\"$BASE/\"" 'Home og:url'
assert_file_contains "$TMP/home.html" "property=\"og:image\" content=\"$BASE/og-image.png\"" 'Home og:image'
assert_file_contains "$TMP/home.html" 'data-sorathai-launch-schema="1"' 'Home launch schema marker'

echo "Checking production response security headers"
HOME_HEADERS="$TMP/home.html.headers"
assert_contains "$(header_value X-Frame-Options "$HOME_HEADERS")" 'DENY' 'Home X-Frame-Options'
PERMISSIONS_POLICY="$(header_value Permissions-Policy "$HOME_HEADERS")"
assert_contains "$PERMISSIONS_POLICY" 'camera=()' 'Home Permissions-Policy camera'
assert_contains "$PERMISSIONS_POLICY" 'microphone=()' 'Home Permissions-Policy microphone'
assert_contains "$PERMISSIONS_POLICY" 'geolocation=()' 'Home Permissions-Policy geolocation'
assert_contains "$(header_value X-Content-Type-Options "$HOME_HEADERS")" 'nosniff' 'Home X-Content-Type-Options'
assert_contains "$(header_value Referrer-Policy "$HOME_HEADERS")" 'strict-origin-when-cross-origin' 'Home Referrer-Policy'

echo "Checking representative public science semantic contract"
fetch_html_contract "/western-astrology.html" "$TMP/western.html"
assert_file_contains "$TMP/western.html" "property=\"og:url\" content=\"$BASE/western-astrology.html\"" 'Western og:url'
assert_file_contains "$TMP/western.html" "property=\"og:image\" content=\"$BASE/og-image.png\"" 'Western og:image'
assert_file_contains "$TMP/western.html" 'data-sorathai-launch-schema="1"' 'Western launch schema marker'
assert_file_not_contains "$TMP/western.html" 'name="robots" content="noindex' 'Western public indexability'

echo "Checking noindex shell semantic contracts"
fetch_html_contract "/profile.html" "$TMP/profile.html"
assert_file_contains "$TMP/profile.html" 'name="robots" content="noindex,follow"' 'Combined Profile robots'
assert_header_file_not_contains_ci "$TMP/profile.html.headers" 'rel="canonical"' 'Combined Profile canonical exclusion'
fetch_html_contract "/dream-result.html" "$TMP/dream-result.html"
assert_file_contains "$TMP/dream-result.html" 'name="robots" content="noindex,follow"' 'Dream result robots'
assert_header_file_not_contains_ci "$TMP/dream-result.html.headers" 'rel="canonical"' 'Dream result canonical exclusion'

echo "Checking social preview asset"
fetch_with_retry "$BASE/og-image.png" "$TMP/og-image.png" "$TMP/og-image.headers"
OG_TYPE="$(header_value Content-Type "$TMP/og-image.headers")"
assert_contains "$OG_TYPE" 'image/png' 'og-image Content-Type'
if [[ ! -s "$TMP/og-image.png" ]]; then
  echo "FAIL: og-image.png response is empty" >&2
  exit 1
fi

echo "Production crawler + canonical + semantic + security-header smoke passed for ${#URLS[@]} sitemap routes."
