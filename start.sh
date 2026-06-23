#!/bin/bash
echo "Uruchamianie widżetu MPK na Raspberry Pi..."


git pull origin main


xset s off
xset -dpms
xset s noblank


chromium-browser --disable-web-security --user-data-dir="/tmp/mpk_kiosk" --kiosk "file://$(pwd)/index.html"