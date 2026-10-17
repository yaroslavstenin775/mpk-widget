#!/bin/bash

CHROME_BIN="/home/yaroslav/Downloads/chrome-linux/chrome"
URL="http://localhost:3000"
PROFILE_DIR="/tmp/chrome_test_profile_arch"

"$CHROME_BIN" \
  --disable-web-security \
  --user-data-dir="$PROFILE_DIR" \
  --disable-gpu \
  --no-sandbox \
  --disable-dev-shm-usage \
  --ignore-certificate-errors \
  --disable-features=IsolateOrigins,site-per-process \
  "$URL"