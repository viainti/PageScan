# PageScan

PageScan is a Chrome extension that extracts a website's visual style system from the active tab and turns it into structured markdown you can use immediately.

It generates:
- `DESIGN.md` output for design direction and UI implementation
- `SKILL.md` output for AI-assisted workflows (Claude Code, Codex, Stitch, etc.)

Repository: `https://github.com/viainti/PageScan`

## What this project is for

PageScan helps you go from visual inspiration to implementation faster by extracting key style tokens from any website:
- Colors
- Typography
- Border radius
- Spacing patterns

Main use cases:
- Build consistent UI faster
- Create reusable design context for AI tools
- Turn reference websites into actionable style guides

## Features

- Chrome Extension (Manifest V3)
- Popup UI built with Next.js + Tailwind CSS
- One-click extraction from current tab
- Markdown generation in 2 modes (`DESIGN.md`, `SKILL.md`)
- Copy-to-clipboard output

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Chrome Extensions API (`activeTab`, `scripting`)

## Project structure

- `src/app/page.tsx` — extension popup UI and extraction logic
- `public/manifest.json` — Chrome extension manifest
- `scripts/pack-extension.mjs` — builds a Chrome-loadable package in `dist-extension/`
- `dist-extension/` — final unpacked extension folder to load in Chrome

## Clone the repository

```bash
git clone https://github.com/viainti/PageScan.git
cd PageScan
```

## Install dependencies

```bash
npm install
```

## Run in development mode (web preview)

```bash
npm run dev
```

This starts a local Next.js preview so you can iterate on UI quickly.

## Build the extension

```bash
npm run build
npm run build:extension
```

After this, the extension package is available in:
- `dist-extension/`

## Install in Google Chrome (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select your local `dist-extension/` folder
5. Pin **PageScan** from the extensions menu

Important:
- Load `dist-extension/`, not `out/`

## How to use PageScan

1. Open any normal website (`https://` or `http://`)
2. Click the PageScan extension icon
3. Choose mode: `DESIGN.md` or `SKILL.md`
4. Click **Refresh** to extract styles from the active tab
5. Click **Copy** to copy generated markdown

## Permissions explained

- `activeTab`: access only the current active tab when the user triggers extraction
- `scripting`: run extraction script on the active page to read computed styles
- `host_permissions` (`<all_urls>`): allow extraction on any user-selected website

## Privacy Policy

Last updated: April 19, 2026

PageScan processes only what is needed to perform user-triggered extraction from the active tab:
- Active tab URL
- Page title
- Computed visual style data (colors, fonts, radius, spacing)

PageScan does **not**:
- collect passwords or login credentials
- sell or share user data
- run background crawling
- track browsing silently

Data handling:
- Processing is performed locally in the browser
- Generated output is shown in the popup
- User chooses whether to copy/export the output

## Publishing notes

For Chrome Web Store uploads, use the packaged folder output and zip its contents correctly so `manifest.json` is in the root of the zip.

## License

Add your preferred license in this repository if not already defined.
