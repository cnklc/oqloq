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

The app persists data to browser LocalStorage:

- `oqlock_blocks` - Current routine blocks
- `oqlock_templates` - Custom user templates
- `oqlock_current_template` - Active template ID

### Reset Storage (Browser Console)

```javascript
localStorage.removeItem("oqlock_blocks");
localStorage.removeItem("oqlock_templates");
localStorage.removeItem("oqlock_current_template");
location.reload();
```

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
- **State**: React hooks + LocalStorage
- **Graphics**: SVG
- **Linting**: ESLint + TypeScript

## 📝 Services

### clockService.ts

Time calculations and angle conversions:

- `minutesToDegrees()` - Convert minutes to circle degrees
- `getCurrentTimeInMinutes()` - Get current time
- `getBlockArcPath()` - Generate SVG arc paths for blocks

### storageService.ts

LocalStorage operations:

- `getBlocks()` / `saveBlocks()` - Block persistence
- `getTemplates()` / `saveCustomTemplate()` - Template management
- `getCurrentTemplateId()` / `setCurrentTemplateId()` - Active template

### templateService.ts

Template management:

- `getCurrentTemplate()` - Get active template
- `switchTemplate()` - Change active template
- `createTemplateFromBlocks()` - Save custom template

## 🎯 Hooks

### useCurrentTime()

Provides real-time clock updates every minute:

```typescript
const { currentMinute, currentTimeFormatted } = useCurrentTime();
```

### useRoutineBlocks()

Block state management with persistence:

```typescript
const { blocks, addBlock, updateBlock, deleteBlock, setBlocks } = useRoutineBlocks();
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
