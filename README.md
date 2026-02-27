# Oqloq - 24-Hour Creative Routine Clock

A modern web application for visually planning your day on a 24-hour circular clock. Built with React, TypeScript, and Vite.

🌐 **Live Site**: [https://cnklc.github.io/oqloq/](https://cnklc.github.io/oqloq/)

## 🎯 Features

- 24-hour circular clock visualization with real-time hand movement
- Create, edit, and delete time blocks with custom colors and titles
- Template presets: Student and Professional
- Drag-to-resize time blocks
- LocalStorage persistence
- Responsive design (desktop/mobile)
- Current time display with active block indicator
- Pomodoro timer

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview the Build

```bash
npm run preview
```

## 🚢 GitHub Pages Deployment

Deployment is automated via GitHub Actions. Every push to `main` triggers the workflow defined in `.github/workflows/deploy.yml`, which:

1. Installs dependencies
2. Runs `npm run build`
3. Deploys the `dist/` directory to GitHub Pages

The live site is available at **[https://cnklc.github.io/oqloq/](https://cnklc.github.io/oqloq/)**.

> **Note**: GitHub Pages must be configured to use **GitHub Actions** as the source (Settings → Pages → Source → GitHub Actions).

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS3 (no frameworks)
- **State**: React hooks + LocalStorage
- **Graphics**: SVG
- **Linting**: ESLint + TypeScript

## 💾 LocalStorage

The app persists data to browser LocalStorage:

- `oqlock_blocks` — Current routine blocks
- `oqlock_templates` — Custom user templates
- `oqlock_current_template` — Active template ID

### Reset Storage (Browser Console)

```javascript
localStorage.removeItem("oqlock_blocks");
localStorage.removeItem("oqlock_templates");
localStorage.removeItem("oqlock_current_template");
location.reload();
```

## 📄 License

MIT
