<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" alt="RivalUI Logo" width="128" height="128" />
</p>

<h1 align="center">RivalUI</h1>

<p align="center">
  A modern, cross-platform desktop GUI for configuring SteelSeries mice — powered by <a href="https://github.com/flozz/rivalcfg"><code>rivalcfg</code></a>.
</p>

<p align="center">
  <a href="https://github.com/alvvik/Rivalui/releases/latest"><img src="https://img.shields.io/github/v/release/alvvik/Rivalui?style=flat-square&label=version" alt="Latest Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/alvvik/Rivalui?style=flat-square" alt="License" /></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platforms" />
  <a href="https://github.com/alvvik/Rivalui/actions"><img src="https://img.shields.io/github/actions/workflow/status/alvvik/Rivalui/release.yml?style=flat-square&label=build" alt="Build Status" /></a>
</p>

---

## Features

- **DPI Adjustment** — Smooth, precise sensitivity control with real-time preview
- **RGB Backlight Control** — Full color picker for LED customization
- **Polling Rate Selection** — Switch between polling rates for optimal responsiveness
- **Device Info** — View battery status, firmware version, and hardware details at a glance
- **Cross-Platform** — Native experience on Windows, macOS, and Linux

## Screenshots

<!-- Add screenshots here -->
<!-- ![RivalUI Screenshot](docs/screenshot.png) -->

## Installation

### Download

Grab the latest release for your platform from [**GitHub Releases**](https://github.com/alvvik/Rivalui/releases/latest):

| Platform | Format                      |
| -------- | --------------------------- |
| Windows  | `.exe`                      |
| macOS    | `.dmg`                      |
| Linux    | `.AppImage`, `.deb`, `.rpm` |

### Prerequisites

RivalUI depends on [`rivalcfg`](https://github.com/flozz/rivalcfg) to communicate with SteelSeries hardware. Install it before running the app:

```bash
# Python 3.8+ required
pip install rivalcfg
```

> **Linux users:** you may also need to set up [udev rules](https://github.com/flozz/rivalcfg#setting-up-udev-rules) so `rivalcfg` can access your device without root.

## Development

### Tech Stack

| Layer    | Technology                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Desktop  | [Tauri v2](https://v2.tauri.app/) (Rust)                                                                                  |
| Frontend | [Next.js](https://nextjs.org/) (App Router, static export)                                                                |
| UI       | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/) |

### Getting Started

```bash
# Clone the repository
git clone https://github.com/alvvik/Rivalui.git
cd Rivalui

# Install frontend dependencies
npm install

# Start in development mode (launches both Next.js & Tauri)
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

Compiled binaries will be placed in `src-tauri/target/release/bundle/`.

### Project Structure

```
RivalUI/
├── src/app/                  # Next.js App Router pages
├── src-tauri/            # Tauri / Rust backend
│   ├── src/              # Rust source code
│   ├── icons/            # App icons
│   └── tauri.conf.json   # Tauri configuration
├── public/               # Static assets
├── package.json          # Frontend dependencies & scripts
└── .github/workflows/    # CI/CD (GitHub Actions)
```

## CI/CD

Releases are built automatically via [GitHub Actions](https://github.com/alvvik/Rivalui/actions). Every push to `main` triggers a multi-platform build that compiles native binaries for Windows, macOS (universal), and Linux, then publishes them as a GitHub Release.

## Contributing

Contributions are welcome! Feel free to open an [issue](https://github.com/alvvik/Rivalui/issues) or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with <a href="https://v2.tauri.app/">Tauri</a>, <a href="https://nextjs.org/">Next.js</a>, and <a href="https://github.com/flozz/rivalcfg">rivalcfg</a>
</p>
