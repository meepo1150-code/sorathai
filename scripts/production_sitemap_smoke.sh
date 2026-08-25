#!/usr/bin/env bash
set -euo pipefail

BASE="https://sorathai.pages.dev"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

header_value() {
  local name="$1" file="$2"
  awk -v key="$name" 'BEGIN{IGNORECASE=1} $0 ~ "^" key ":" {sub(/^[^:]+:[[:space:]]*/, ""); gsub(/\r/, ""); value=$0} END{print value}' "$file"
}

fetch_exact() {
  local path="$1" label="$2" user_agent="$3" output="$4" headers="$5"
  local meta code effective redirects

  meta="$(curl --silent --show-error \
    --retry 8 --retry-delay 10 --retry-all-errors \
    --connect-timeout 10 --max-time 45 \
    --user-agent "$user_agent" \
    --dump-header "$headers" --output "$output" \
    --write-out '%{http_code}|%{url_effective}|%{num_redirects}' \
    "$BASE$path")"

  IFS='|' read -r code effective redirects <<< "$meta"

  if [[ "$code" != "200" ]]; then
    echo "FAIL: $label expected HTTP 200 without redirect, got $code" >&2
    exit 1
  fi
  if [[ "$effective" != "$BASE$path" ]]; then
    echo "FAIL: $label effective URL drifted to '$effective'" >&2
    exit 1
  fi
  if [[ "$redirects" != "0" ]]; then
    echo "FAIL: $label unexpectedly followed/reported $redirects redirects" >&2
    exit 1
  fi

  echo "OK: $label HTTP 200 exact URL"
}

assert_xml_response() {
  local output="$1" headers="$2" label="$3"
  local content_type x_robots

  content_type="$(header_value Content-Type "$headers")"
  if [[ "$content_type" != application/xml* && "$content_type" != text/xml* ]]; then
    echo "FAIL: $label Content-Type is '$content_type'" >&2
    exit 1
  fi
  if ! grep -Fq '<urlset' "$output"; then
    echo "FAIL: $label body does not contain <urlset" >&2
    exit 1
  fi
  if grep -Fiq '<html' "$output"; then
    echo "FAIL: $label body unexpectedly looks like HTML" >&2
    exit 1
  fi

  x_robots="$(header_value X-Robots-Tag "$headers")"
  if [[ "${x_robots,,}" == *noindex* ]]; then
    echo "FAIL: $label unexpectedly carries X-Robots-Tag noindex" >&2
    exit 1
  fi

  echo "OK: $label XML response ($content_type)"
}

assert_robots_response() {
  local output="$1" headers="$2" label="$3"
  local content_type

  content_type="$(header_value Content-Type "$headers")"
  if [[ "$content_type" != text/plain* ]]; then
    echo "FAIL: $label Content-Type is '$content_type'" >&2
    exit 1
  fi
  if ! grep -Fq 'User-agent: *' "$output"; then
    echo "FAIL: $label missing User-agent wildcard" >&2
    exit 1
  fi
  if ! grep -Fq "Sitemap: $BASE/sitemap.xml" "$output"; then
    echo "FAIL: $label missing canonical sitemap declaration" >&2
    exit 1
  fi

  echo "OK: $label robots response ($content_type)"
}

GOOGLEBOT_UA='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
DEFAULT_UA='SorathaiProductionSmoke/1.0'

fetch_exact '/sitemap.xml' 'sitemap default-UA' "$DEFAULT_UA" "$TMP/sitemap-default.xml" "$TMP/sitemap-default.headers"
assert_xml_response "$TMP/sitemap-default.xml" "$TMP/sitemap-default.headers" 'sitemap default-UA'

fetch_exact '/sitemap.xml' 'sitemap Googlebot-UA' "$GOOGLEBOT_UA" "$TMP/sitemap-googlebot.xml" "$TMP/sitemap-googlebot.headers"
assert_xml_response "$TMP/sitemap-googlebot.xml" "$TMP/sitemap-googlebot.headers" 'sitemap Googlebot-UA'

if ! cmp -s "$TMP/sitemap-default.xml" "$TMP/sitemap-googlebot.xml"; then
  echo "FAIL: sitemap body differs between default and Googlebot user agents" >&2
  exit 1
fi

echo 'OK: sitemap body is identical for default and Googlebot user agents'

fetch_exact '/robots.txt' 'robots Googlebot-UA' "$GOOGLEBOT_UA" "$TMP/robots-googlebot.txt" "$TMP/robots-googlebot.headers"
assert_robots_response "$TMP/robots-googlebot.txt" "$TMP/robots-googlebot.headers" 'robots Googlebot-UA'

echo 'Production sitemap compatibility smoke passed.'
