# EzBot - Dein cooler Discord-Bot

Ein einfacher, modularer Discord-Bot, der auf Commands reagiert.

## Struktur

- `index.js`: Hauptfile, lädt Events und Commands
- `commands/`: Einzelne Command-Dateien
- `events/`: Event-Handler
- `.env`: Token speichern

## Setup

1. Erstelle einen Bot auf [Discord Developer Portal](https://discord.com/developers/applications).
2. Kopiere den Bot-Token und füge ihn in die `.env`-Datei ein (siehe unten).
3. Lade den Bot auf deinen Server ein (mit dem Invite-Link aus dem Portal).

## Installation

```bash
npm install
```

## Starten

```bash
npm start
```

## Commands

- `/ping`: Pong!
- `/giveaway`: Öffnet ein interaktives Setup-Embed mit Select Menu für Dauer und Buttons für Preis/Rolle. Wähle Dauer aus dem Menü, setze Preis und Rolle (optional) mit Buttons, dann starte. Teilnehmer reagieren mit 🎉. Nur User mit der Rolle nehmen teil, falls gesetzt.

## .env-Datei

Erstelle eine `.env`-Datei im Root-Verzeichnis:

```
DISCORD_TOKEN=dein_bot_token_hier
```

**Wichtig:** Teile deinen Token NIEMALS öffentlich! Er ist wie ein Passwort.