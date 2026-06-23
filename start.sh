#!/bin/bash
echo "Uruchamianie widżetu MPK na Raspberry Pi..."

# Pobierz ewentualne nowe poprawki z Twojego GitHuba
git pull origin main

# Wyłącz usypianie ekranu (żeby tablica nie zgasła po 10 minutach)
xset s off
xset -dpms
xset s noblank

# Odpal przeglądarkę bez blokad, na pełnym ekranie (kiosk)
chromium-browser --disable-web-security --user-data-dir="/tmp/mpk_kiosk" --kiosk "file://$(pwd)/index.html"