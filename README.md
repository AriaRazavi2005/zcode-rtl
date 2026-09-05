# ZCode Smart RTL 🇮🇷 🇸🇦 🇮🇱

[English](README.md) | [فارسی](README.fa.md)

A smart **RTL (Right-to-Left)** patcher and UI customizer for the **ZCode Desktop** application, bringing native support for Persian, Arabic, and Hebrew languages with customizable fonts and a floating settings widget.

> Inspired by [antigravity-rtl](https://github.com/AriaRazavi2005/antigravity-rtl).

---

## ✨ Features

- **Automatic RTL Detection:** Detects Persian/Arabic/Hebrew input and output text in real-time.
- **Smart Mixed-Language Direction:** Correctly detects RTL even when a Persian sentence starts with English words (e.g. «Docker یک ابزار عالی است») using character-ratio analysis, not just the first letter.
- **Embedded Vazirmatn Variable Font:** Ships with beautiful Vazirmatn variable font bundled offline.
- **Custom Font Support:** Set your preferred Persian font (e.g. Shabnam, IRANSans, Dana, Vazirmatn) and English font.
- **Working Font Size & Line Height:** Overrides ZCode's UI typography tokens (`--ui-font-size`, `--text-ui-*`, `--tw-leading`) and targets `.prose` / markdown containers directly, so the sliders actually work on chat messages.
- **Floating Settings Widget:** A modern UI widget to adjust:
  - RTL Toggle on/off (Quick shortcut: `Alt + R`)
  - Force RTL mode (forces RTL layout even if the text starts with English words)
  - Custom Persian, English, and Code fonts
  - Chat Line Height slider (with live value display)
  - Font Size slider (with live value display)
  - Persian Keyboard `@` Fix (`Shift + 2` outputs `@` instead of `٬`)
- **DevTools Unlock:** Enables right-click → *Inspect Element* in the packaged app (version-resilient patch).
- **Safe & Reversible:** Creates an automatic backup (`app.asar.bak`) before patching, with a one-command restore option. If `app.asar` is ever corrupted by an interrupted patch, the patcher recovers from the backup automatically.
- **Auto Relaunch:** Optionally launches ZCode right after patching.
- **Cross-Platform:** Works on Windows, macOS, and Linux.

---

## ⚠️ Important: ZCode Updates

ZCode's auto-updater replaces `app.asar` and **removes the patch** (and the backup file) on every update. After each ZCode update, simply re-run the patcher:

```bash
npx zcode-rtl
```

---

## 📋 Changelog

### v1.1.0
- Fixed: RTL now works for sentences starting with English words (smart character-ratio detection).
- Fixed: Font Size and Line Height sliders now actually affect chat text (CSS variable + `.prose` overrides).
- Added: Live value display on sliders.
- Added: Auto-relaunch ZCode after patching.
- Added: Corruption recovery from `app.asar.bak`.
- Improved: DevTools unlock patch is now resilient across ZCode builds (minified variable names change per version).
- Verified: Compatible with ZCode 3.11.2.

### v1.0.0
- Initial release. Renderer-level injection via `index.html` + preload bridge.

---

## 📦 Prerequisites — No Node.js yet?

`zcode-rtl` runs on **Node.js 18+** (which includes `npx`). Don't have it installed? One command and you're set:

| OS | Install command |
| :--- | :--- |
| Windows | `winget install OpenJS.NodeJS.LTS` — or download the installer from [nodejs.org](https://nodejs.org/en/download) |
| macOS | `brew install node` — or download the installer from [nodejs.org](https://nodejs.org/en/download) |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh \| bash` → restart terminal → `nvm install --lts` |

Verify with `node -v` (should show `v18` or higher), then continue below.

---

## 🚀 Quick Start

### 1. Run with `npx` (No installation needed)

```bash
npx zcode-rtl
```

### 2. Or Install Globally

```bash
npm install -g zcode-rtl
zcode-rtl
```

> **Note for Windows users:** If ZCode is installed in `C:\Program Files`, make sure to run your terminal (Command Prompt or PowerShell) as **Administrator**.
>
> **Note for macOS / Linux users:** Run with `sudo`:
> ```bash
> sudo npx zcode-rtl
> ```

---

## 🤖 Too Lazy? Let Your AI Agent Do It

Using an AI coding agent like **ZCode, Antigravity, Cursor, Copilot or Claude Code**? Copy the block below, paste it into your agent's chat, and it will handle the whole setup for you — Node.js install included:

```text
You are my setup assistant. Install and configure the "zcode-rtl" patcher on this machine.

1. Check if Node.js v18+ is installed (run: node -v). If it's missing or older than v18, install the LTS version:
   - Windows: winget install OpenJS.NodeJS.LTS  (or download from https://nodejs.org)
   - macOS:   brew install node
   - Linux:   install nvm, then: nvm install --lts
2. IMPORTANT: If you (the agent) are running INSIDE ZCode Desktop, do NOT execute the
   patcher from this session — the patcher closes ZCode and your session will be killed
   mid-run. In that case, print the exact manual commands for me and stop.
3. If you are running outside ZCode, execute: npx zcode-rtl@latest
   - Windows: the terminal must be elevated (Run as Administrator), because ZCode is
     installed under C:\Program Files.
   - macOS/Linux: run it with sudo.
   - When it asks to close ZCode automatically, answer Yes.
4. After patching finishes, relaunch ZCode and verify the floating blue RTL widget
   appears near the bottom-right corner.
5. Rollback option at any time: npx zcode-rtl --restore

Note: ZCode updates remove the patch. After every ZCode update, re-run npx zcode-rtl@latest.
```

---

## 🔄 How to Restore Original ZCode

If you ever want to revert back to the original unmodified ZCode:

```bash
npx zcode-rtl --restore
```

---

## ⚙️ Configuration & Shortcuts

| Feature | Description | Default |
| :--- | :--- | :--- |
| **Toggle RTL** | `Alt + R` | Enabled |
| **Persian Keyboard @ Fix** | Pressing `Shift + 2` types `@` | Enabled |
| **Default Persian Font** | Vazirmatn Variable | Bundled |
| **Config Storage** | Browser `localStorage` (key: `zcode-rtl-config`) | Auto-saved |

---

## 🛠️ Development & Local Testing

```bash
cd zcode-rtl
npm install
node ./bin/index.js
```

---

## 📄 License

MIT License © [Aria Razavi](https://github.com/AriaRazavi2005)
