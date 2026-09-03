# ZCode Smart RTL 🇮🇷 🇸🇦 🇮🇱

A smart **RTL (Right-to-Left)** patcher and UI customizer for the **ZCode Desktop** application, bringing native support for Persian, Arabic, and Hebrew languages with customizable fonts and a floating settings widget.

Inspired by [antigravity-rtl](https://github.com/AriaRazavi2005/antigravity-rtl).

---

## ✨ Features

- **Automatic RTL Detection:** Detects Persian/Arabic/Hebrew input and output text in real-time.
- **Embedded Vazirmatn Variable Font:** Ships with beautiful Vazirmatn variable font bundled offline.
- **Custom Font Support:** Set your preferred Persian font (e.g. Shabnam, IRANSans, Dana, Vazirmatn) and English font.
- **Floating Settings Widget:** A modern UI widget to adjust:
  - RTL Toggle on/off (Quick shortcut: `Alt + R`)
  - Force RTL mode (forces RTL layout even if the text starts with English words)
  - Custom Persian, English, and Code fonts
  - Chat Line Height slider
  - Font Size slider
  - Persian Keyboard `@` Fix (`Shift + 2` outputs `@` instead of `٬`)
- **Safe & Reversible:** Creates an automatic backup (`app.asar.bak`) before patching, with a one-command restore option.
- **Cross-Platform:** Works on Windows, macOS, and Linux.

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
| **Config Location** | `~/.zcode-rtl.json` | Auto-saved |

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
