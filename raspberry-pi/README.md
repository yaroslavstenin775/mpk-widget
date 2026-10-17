# Uruchomienie na Raspberry Pi

Konfiguracja jest przygotowana dla Raspberry Pi OS z ekranem 800×480 i sesją graficzną.

## 1. Instalacja zależności

```bash
sudo apt update
sudo apt install -y nodejs npm chromium curl
```

Skopiuj cały projekt do `/home/pi/mpk-widget`, a następnie w katalogu projektu wykonaj:

```bash
cd /home/pi/mpk-widget
npm install
chmod +x start.sh
```

Jeżeli projekt znajduje się w innym katalogu, zmień wartość `APP_DIR` w `start.sh` albo uruchom skrypt z własną wartością, np.:

```bash
APP_DIR=/home/pi/projekty/mpk-widget ./start.sh
```

## 2. Automatyczny start po zalogowaniu

W `sudo raspi-config` włącz logowanie do pulpitu bez pytania o hasło: `System Options` → `Boot / Auto Login` → `Desktop Autologin`.

```bash
mkdir -p ~/.config/autostart
cp raspberry-pi/mpk-widget.desktop ~/.config/autostart/
```

Plik `.desktop` zakłada lokalizację `/home/pi/mpk-widget`. Jeśli używasz innej ścieżki, popraw w nim wartość `Exec`.

Po ponownym uruchomieniu Raspberry Pi skrypt:

1. uruchomi lokalny serwer Node.js,
2. poczeka na dostępność `http://127.0.0.1:3000`,
3. otworzy widget w Chromium w trybie kiosk,
4. wyłączy wygaszanie ekranu.

Serwer zapisuje logi do `/tmp/mpk-widget-server.log`.
