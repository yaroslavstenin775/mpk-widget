#!/usr/bin/env bash

set -u

APP_DIR="${APP_DIR:-/home/pi/mpk-widget}"
SERVER_URL="http://127.0.0.1:3000"

if ! command -v curl >/dev/null 2>&1; then
    echo "Brak programu curl. Zainstaluj go poleceniem: sudo apt install curl"
    exit 1
fi

if command -v chromium >/dev/null 2>&1; then
    BROWSER_BIN="$(command -v chromium)"
elif command -v chromium-browser >/dev/null 2>&1; then
    BROWSER_BIN="$(command -v chromium-browser)"
else
    echo "Nie znaleziono Chromium. Zainstaluj je poleceniem: sudo apt install chromium"
    exit 1
fi

cd "$APP_DIR" || exit 1

# Uruchom serwer tylko wtedy, gdy nie działa już jako usługa lub proces.
if ! curl --silent --fail "$SERVER_URL" >/dev/null 2>&1; then
    if command -v node >/dev/null 2>&1; then
        nohup node "$APP_DIR/server.js" >>/tmp/mpk-widget-server.log 2>&1 &
    else
        echo "Nie znaleziono Node.js. Zainstaluj Node.js przed uruchomieniem widgetu."
        exit 1
    fi
fi

until curl --silent --fail "$SERVER_URL" >/dev/null 2>&1; do
    sleep 1
done

# Wyłącz wygaszanie ekranu w sesji graficznej Raspberry Pi.
xset s off >/dev/null 2>&1 || true
xset -dpms >/dev/null 2>&1 || true
xset s noblank >/dev/null 2>&1 || true

exec "$BROWSER_BIN" \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --user-data-dir="/tmp/mpk_kiosk" \
    "$SERVER_URL"
