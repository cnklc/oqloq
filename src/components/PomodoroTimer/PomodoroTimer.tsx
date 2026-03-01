/**
 * PomodoroTimer Component - Bauhaus Edition
 * Focus timer with geometric icons: Triangle=Play, Square=Stop, Circle=Reset
 */

import React, { useState, useEffect, useCallback } from "react";
import { getPomodoroSettings, onPomodoroSettingsChange } from "../../services/pomodoroService";
import "./PomodoroTimer.css";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
inline?: boolean;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ inline = false }) => {
const [settings, setSettings] = useState(() => getPomodoroSettings());

useEffect(() => {
const cleanup = onPomodoroSettingsChange((newSettings) => {
setSettings(newSettings);
});
return cleanup;
}, []);

const [mode, setMode] = useState<TimerMode>("work");
const [isRunning, setIsRunning] = useState(false);
const [completedPomodoros, setCompletedPomodoros] = useState(0);

const getDuration = useCallback(
(currentMode: TimerMode): number => {
switch (currentMode) {
case "work":
return settings.workDuration * 60;
case "shortBreak":
return settings.shortBreak * 60;
case "longBreak":
return settings.longBreak * 60;
}
},
[settings]
);

const [timeLeft, setTimeLeft] = useState(() => getDuration("work"));
const [originalTitle] = useState(() => document.title);

useEffect(() => {
const newDuration = getDuration(mode);
queueMicrotask(() => {
setTimeLeft(newDuration);
setIsRunning(false);
});
}, [mode, getDuration]);

const handleTimerComplete = useCallback(() => {
setIsRunning(false);

try {
const audio = new Audio(
"data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIG2m98OScTgwOUKbh8LljHAU2kdfy0HotBSN1xe/akUELFFyz6uqnVRUMRaDh8r5sIgYtgs/z3Ik3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tF6LQUjdcXv2pFBCxRcs+rqp1YVDEWg4fK/bCIGLYLP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUXLPq6qdWFQxFoOHyv2wiBi2Cz/PdiTYIG2q98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUALFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz"
);
audio.play().catch(() => {});
} catch {
// Ignore audio errors
}

if ("Notification" in window && Notification.permission === "granted") {
const title = mode === "work" ? "Break Time!" : "Work Time!";
const body =
mode === "work" ? "Great job! Time for a break." : "Break is over. Ready to focus?";
const notifOptions: NotificationOptions = { body, icon: "/vite.svg" };

if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
navigator.serviceWorker.ready
.then((registration) => {
registration.showNotification(title, notifOptions);
})
.catch(() => {
const notif = new Notification(title, notifOptions);
notif.onclick = () => { window.focus(); notif.close(); };
});
} else {
const notif = new Notification(title, notifOptions);
notif.onclick = () => { window.focus(); notif.close(); };
}
}

if (mode === "work") {
const newCount = completedPomodoros + 1;
setCompletedPomodoros(newCount);
if (newCount % settings.longBreakInterval === 0) {
setMode("longBreak");
} else {
setMode("shortBreak");
}
} else {
setMode("work");
}
}, [mode, completedPomodoros, settings.longBreakInterval]);

useEffect(() => {
if (!isRunning || timeLeft <= 0) return;
const interval = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) { handleTimerComplete(); return 0; }
return prev - 1;
});
}, 1000);
return () => clearInterval(interval);
}, [isRunning, timeLeft, handleTimerComplete]);

const toggleTimer = () => {
if (!isRunning && "Notification" in window && Notification.permission === "default") {
Notification.requestPermission();
}
setIsRunning(!isRunning);
};

// Reset (Circle icon): stops and resets to full duration
const resetTimer = () => {
setIsRunning(false);
setTimeLeft(getDuration(mode));
};

// Stop (Square icon): stops and resets to full duration
const stopTimer = () => {
setIsRunning(false);
setTimeLeft(getDuration(mode));
};

const formatTime = (seconds: number): string => {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getModeLabel = (): string => {
switch (mode) {
case "work": return "Focus";
case "shortBreak": return "Short Break";
case "longBreak": return "Long Break";
}
};

useEffect(() => {
if (isRunning) {
document.title = `⏱ ${formatTime(timeLeft)} — ${getModeLabel()}`;
} else {
document.title = originalTitle;
}
return () => { document.title = originalTitle; };
});

const progress = 1 - timeLeft / getDuration(mode);

if (inline) {
return (
<div className="pomodoro-inline">
<div className="pomodoro-mode-label">{getModeLabel()}</div>

{/* Red circle with countdown - Bauhaus Focus Module */}
<div className="pomodoro-circle-wrapper">
<svg viewBox="0 0 160 160" className="pomodoro-circle-svg">
<circle cx="80" cy="80" r="72" fill="#E63946" />
<circle
cx="80" cy="80" r="72"
fill="none"
stroke="#1A1A1A"
strokeWidth="72"
strokeDasharray={`${2 * Math.PI * 72}`}
strokeDashoffset={2 * Math.PI * 72 * progress}
transform="rotate(-90 80 80)"
opacity="0.2"
/>
<text
x="80" y="80"
textAnchor="middle"
dominantBaseline="middle"
fontSize="28"
fontFamily="'JetBrains Mono', 'Courier New', monospace"
fontWeight="700"
fill="#F2F2F2"
letterSpacing="1"
>
{formatTime(timeLeft)}
</text>
</svg>
</div>

{/* Geometric icon controls */}
<div className="pomodoro-controls-inline">
{/* Play/Pause = Triangle / Two Rectangles */}
<button className="pomodoro-btn" onClick={toggleTimer}
aria-label={isRunning ? "Pause" : "Play"} title={isRunning ? "Pause" : "Play"}>
<svg viewBox="0 0 24 24" width="20" height="20">
{isRunning ? (
<>
<rect x="5" y="4" width="4" height="16" fill="currentColor" />
<rect x="15" y="4" width="4" height="16" fill="currentColor" />
</>
) : (
<polygon points="5,3 19,12 5,21" fill="currentColor" />
)}
</svg>
</button>

{/* Stop = Square */}
<button className="pomodoro-btn" onClick={stopTimer} aria-label="Stop" title="Stop">
<svg viewBox="0 0 24 24" width="20" height="20">
<rect x="4" y="4" width="16" height="16" fill="currentColor" />
</svg>
</button>

{/* Reset = Circle with arrow */}
<button className="pomodoro-btn" onClick={resetTimer} aria-label="Reset" title="Reset">
<svg viewBox="0 0 24 24" width="20" height="20">
<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
<polygon points="12,3 17,9 7,9" fill="currentColor" />
</svg>
</button>
</div>

{/* Mode switcher */}
<div className="pomodoro-modes">
{(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
<button
key={m}
className={`pomodoro-mode-btn ${mode === m ? "active" : ""}`}
onClick={() => setMode(m)}
>
{m === "work" ? "F" : m === "shortBreak" ? "S" : "L"}
</button>
))}
</div>

<div className="pomodoro-completed">
{Array.from({ length: Math.min(completedPomodoros, 8) }, (_, i) => (
<span key={i} className="pomodoro-dot" />
))}
</div>
</div>
);
}

// Standalone fixed mode (legacy)
return (
<div className="pomodoro-timer">
<div className="pomodoro-header">
<div className="pomodoro-mode">
<span className="mode-label">{getModeLabel()}</span>
</div>
</div>

<div className="pomodoro-display">
<svg viewBox="0 0 200 200" style={{ width: "200px", height: "200px" }}>
<circle cx="100" cy="100" r="90" fill="#E63946" />
<circle
cx="100" cy="100" r="90"
fill="none" stroke="#1A1A1A" strokeWidth="90"
strokeDasharray={`${2 * Math.PI * 90}`}
strokeDashoffset={2 * Math.PI * 90 * progress}
transform="rotate(-90 100 100)"
opacity="0.2"
/>
<text
x="100" y="100"
textAnchor="middle" dominantBaseline="middle"
fontSize="36"
fontFamily="'JetBrains Mono', 'Courier New', monospace"
fontWeight="700" fill="#F2F2F2"
>
{formatTime(timeLeft)}
</text>
</svg>
</div>

<div className="pomodoro-controls">
<button className="control-btn primary" onClick={toggleTimer} aria-label={isRunning ? "Pause" : "Start"}>
<svg viewBox="0 0 24 24" width="22" height="22">
{isRunning ? (
<>
<rect x="5" y="4" width="4" height="16" fill="currentColor" />
<rect x="15" y="4" width="4" height="16" fill="currentColor" />
</>
) : (
<polygon points="5,3 19,12 5,21" fill="currentColor" />
)}
</svg>
</button>
<button className="control-btn secondary" onClick={stopTimer} aria-label="Stop">
<svg viewBox="0 0 24 24" width="20" height="20">
<rect x="4" y="4" width="16" height="16" fill="currentColor" />
</svg>
</button>
<button className="control-btn secondary" onClick={resetTimer} aria-label="Reset">
<svg viewBox="0 0 24 24" width="20" height="20">
<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
<polygon points="12,3 17,9 7,9" fill="currentColor" />
</svg>
</button>
</div>

<div className="pomodoro-stats">
<span>Completed: {completedPomodoros}</span>
</div>
</div>
);
};
