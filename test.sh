#!/bin/bash

mkdir -p /tmp/mpk_test_pc

# Sprawdzanie standardowych ścieżek oraz systemów Flatpak i Snap
if command -v google-chrome-stable &> /dev/null; then
    BROWSER="google-chrome-stable"
elif command -v google-chrome &> /dev/null; then
    BROWSER="google-chrome"
elif command -v flatpak &> /dev/null && flatpak list | grep -q "com.google.Chrome"; then
    BROWSER="flatpak run com.google.Chrome"
elif command -v snap &> /dev/null && snap list | grep -q "chromium"; then
    BROWSER="snap run chromium"
elif command -v chromium &> /dev/null; then
    BROWSER="chromium"
else
    echo "Nie znalazłem żadnej wersji Chrome/Chromium! Sprawdź, czy na pewno jest zainstalowana."
    exit 1
fi

echo "Uruchamiam przeglądarkę komendą: $BROWSER"
$BROWSER --disable-web-security --user-data-dir="/tmp/mpk_test_pc" "$(pwd)/index.html"
