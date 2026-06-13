# Oqloq - 24-Hour Creative Routine Clock

A modern web application for visually planning your day on a 24-hour circular clock. Built with React, TypeScript, and Vite.

## 🎯 Features

✨ **Core Features (MVP)**

- 24-hour circular clock visualization with real-time hand movement
- Create, edit, and delete time blocks with custom colors and titles
- Two template presets: Student and Professional
- Drag-to-resize time blocks
- LocalStorage persistence
- Responsive design (desktop/mobile)
- Current time display with active block indicator

🎨 **Design Highlights**

- Minimal, calm aesthetic with soft color palette
- Smooth animations and transitions
- Large, readable typography
- Clean SVG-based clock
- Intuitive hover and selection feedback

## 📁 Project Structure

```
src/
├── components/                 # Reusable React components
│   ├── Clock/                 # 24-hour circular clock (SVG)
│   │   ├── Clock.tsx          # Main clock component
│   │   └── Clock.css          # Clock styling
│   ├── BlockEditor/           # Form for creating/editing blocks
│   │   ├── BlockEditor.tsx
│   │   └── BlockEditor.css
│   ├── BlockSegment/          # Individual block visualization
│   ├── TemplateSelector/      # Template switcher
│   │   ├── TemplateSelector.tsx
│   │   └── TemplateSelector.css
│
├── pages/                      # Full-page components
│   ├── Dashboard.tsx          # Main application page
│   └── Dashboard.css
│
├── services/                   # Business logic & utilities
│   ├── clockService.ts        # Time calculations & conversions
│   ├── storageService.ts      # LocalStorage CRUD operations
│   └── templateService.ts     # Template management
│
├── hooks/                      # Custom React hooks
│   ├── useCurrentTime.ts      # Real-time clock updates
│   └── useRoutineBlocks.ts    # Block state management
│
├── types/                      # TypeScript types & interfaces
│   └── models.ts              # Data models & defaults
│
├── styles/                     # Global styles
│   └── globals.css            # CSS variables, reset, base styles
│
├── App.tsx                     # Root component
└── main.tsx                    # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

```bash
cd /Users/can/Project/Agent/oqlock
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

Outputs to `dist/` directory

### Preview Build

```bash
npm run preview
```

## 📊 Data Models

### RoutineBlock

```typescript
interface RoutineBlock {
	id: string; // Unique identifier
	title: string; // Block name (e.g., "Deep Work")
	color: string; // Hex color code
	startMinute: number; // 0-1439 (00:00 - 23:59)
	endMinute: number; // 0-1439
}
```

### Template

```typescript
interface Template {
	id: string; // Unique identifier
	name: string; // Display name
	blocks: RoutineBlock[]; // Array of blocks
}
```

## 🎨 Color Palette

Default colors available in the editor:

- **Pink** (#FFB4D6) - Primary
- **Light Blue** (#A8D8FF)
- **Peachy** (#FFD6A5)
- **Light Green** (#CAFFBF)
- **Lavender** (#E0D5FF)
- **Pale Yellow** (#FFF4B0)
- **Cyan** (#B4E3FF)
- **Light Pink** (#FFD1DC)

## 💾 LocalStorage

State is managed with [Zustand](https://github.com/pmndrs/zustand) and persisted to
browser LocalStorage via the `persist` middleware:

- `oqlock-storage` - Routine blocks, templates, and the active template ID (`useRoutineStore`)
- `oqlock-appearance` - Background color, clock face color, and clock scale (`useAppearanceStore`)
- `oqlock-theme` - Light/dark theme preference (`ThemeToggle`)
- `pomodoroSettings` - Pomodoro durations (`pomodoroService`)

### Reset Storage (Browser Console)

```javascript
localStorage.clear();
location.reload();
```

You can also use **Settings → Data Management → Reset All Data** in the app.

## 📱 Usage

### Creating a Block

1. Click on an empty area of the clock
2. Fill in the form: title, time range, color
3. Click "Create"

### Editing a Block

1. Click on a block in the clock
2. Click the "Edit" button in the sidebar
3. Modify the details
4. Click "Update"

### Deleting a Block

1. Click on a block
2. Click "Edit"
3. Click "Delete" and confirm

### Switching Templates

1. Click a template button (Student/Professional)
2. Confirm to replace current blocks
3. All blocks are updated to template blocks

### Time Input

- Use 24-hour format (15:30 for 3:30 PM)
- Time blocks update automatically

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS3 (no frameworks)
- **State**: Zustand (with `persist` middleware to LocalStorage)
- **Graphics**: SVG
- **Animation**: Framer Motion
- **Icons**: lucide-react
- **Testing**: Vitest
- **Linting**: ESLint + TypeScript

## 📝 Services

### clockService.ts

Time calculations and angle conversions:

- `minutesToDegrees()` / `degreesToMinutes()` - Minute ↔ circle-degree conversion
- `getCurrentTimeInMinutes()` / `getCurrentTimeFormatted()` - Current time
- `getBlockArcPath()` - Generate SVG arc paths for blocks (handles midnight crossover)
- `isTimeInBlock()` - Active-block detection (handles midnight crossover)
- `clampMinutes()`, `minutesToTimeString()`, `timeStringToMinutes()` - Helpers

### pomodoroService.ts

Pomodoro settings persistence and a change-event subscription used by the timer and
settings panel.

## 🎯 Hooks (Zustand stores)

### useRoutineStore()

Routine blocks, templates, and the active template — persisted to `oqlock-storage`:

```typescript
const { blocks, addBlock, updateBlock, deleteBlock, templates, applyTemplate } = useRoutineStore();
```

### useAppearanceStore()

Background/clock-face colors and clock scale — persisted to `oqlock-appearance`.

### useCurrentTime()

Provides real-time clock updates aligned to the minute boundary:

```typescript
const { currentMinute, currentTimeFormatted } = useCurrentTime();
```

## 🎛️ CSS Variables

Customize appearance by modifying `src/styles/globals.css`:

```css
:root {
	--primary: #ffb4d6;
	--accent: #ff6b6b;
	--text-primary: #333333;
	--bg-primary: #ffffff;
	/* ... more variables ... */
}
```

## 🔮 Future Enhancements

These features are not included in MVP but could be added:

1. **Plan vs Reality** - Track actual time vs planned time
2. **PWA Support** - Offline functionality, installable app
3. **Custom Templates** - Save & load user-created templates
4. **Analytics** - Visualize routine patterns over time
5. **Notifications** - Alerts when block is about to end
6. **Dark Mode** - CSS media query support present but not UI toggle
7. **Export/Import** - Save schedule as JSON
8. **Themes** - Different color schemes
9. **Calendar View** - Week/month view of routines

## 🐛 Troubleshooting

### Blocks not persisting?

- Check browser's IndexedDB/LocalStorage is enabled
- Try clearing storage and starting fresh
- Check browser console for errors

### Clock hand not moving?

- Refresh the page
- Check browser console for JavaScript errors
- Verify time format in blocks is valid

### Styling issues?

- Clear browser cache (Cmd+Shift+Delete)
- Hard refresh (Cmd+Shift+R)
- Check CSS files are imported correctly

## 📄 License

MIT

## 🙌 Credits

Inspired by the physical "Oqloq – 24-hour Creative Routine Clock" product.
