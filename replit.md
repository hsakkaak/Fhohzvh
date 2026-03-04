# SHOUROV-BOT V2

A Facebook Messenger bot built on the GoatBot V2 framework. It connects to Facebook using cookies/credentials and provides a web dashboard for management.

## Project Structure

- `index.js` - Entry point, spawns `Shourov.js` and handles auto-restart on exit code 2
- `Shourov.js` - Main bot script, loads config, initializes globals, handles login
- `Shourov.json` - Bot configuration (Facebook account, dashboard settings, permissions, etc.)
- `Shourov.txt` - Facebook session cookies (JSON format)
- `configCommands.json` - Command configuration
- `bot/` - Bot core (login, event handlers)
- `dashboard/` - Express web dashboard (runs on port 5000)
- `database/` - Database models (SQLite by default)
- `func/` - Utility functions
- `languages/` - i18n language files
- `logger/` - Logging utilities
- `public/` - Static assets
- `scripts/` - Bot command scripts
- `fb-chat-api/` - Facebook Chat API integration

## Configuration

- Dashboard port: **5000** (changed from 3001 for Replit webview compatibility)
- Database: SQLite (default)
- Timezone: Asia/Dhaka
- Language: English

## Running

The workflow runs `node index.js` which spawns `Shourov.js`.

**Important:** The bot requires valid Facebook session cookies in `Shourov.txt` to start successfully. The dashboard (port 5000) only becomes available after the bot successfully logs into Facebook.

## Dependencies

- Node.js 20.x (installed via Nix)
- System dependency: `libuuid` (for canvas package)
- All npm packages from `package.json`

## Setup Notes

- Fixed `index.js`: removed undefined `startBot()` call on line 20
- Dashboard port changed to 5000 in `Shourov.json` for Replit webview
- System dependency `libuuid` installed for canvas package support
