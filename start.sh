#!/bin/bash
echo "Uruchamianie widżetu "


cd /home/yaroslav/mpk-widget


git pull origin main


xset s off
xset -dpms
xset s noblank

chromium --disable-web-security --user-data-dir="/tmp/mpk_kiosk" --kiosk "file:///home/yaroslav/mpk-widget/index.html"