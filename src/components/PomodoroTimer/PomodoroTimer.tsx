/**
 * PomodoroTimer Component
 * Fixed position timer in bottom-left corner
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPomodoroSettings, onPomodoroSettingsChange } from "../../services/pomodoroService";
import {
	requestNotificationPermission,
	notifyTimerComplete,
	isNotificationSupported,
	getNotificationPermission,
} from "../../services/notificationService";
import { useRoutineStore } from "../../hooks/useRoutineStore";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { isTimeInBlock } from "../../services/clockService";
import { startWatchTick, stopWatchTick } from "../../services/watchTickService";
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Target, Coffee, TreePalm, Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./PomodoroTimer.css";

type TimerMode = "work" | "shortBreak" | "longBreak";

export const PomodoroTimer: React.FC = () => {
	const { blocks } = useRoutineStore();
	const { currentMinute } = useCurrentTime();
	const [settings, setSettings] = useState(() => getPomodoroSettings());

	useEffect(() => {
		const cleanup = onPomodoroSettingsChange((newSettings) => {
			setSettings(newSettings);
		});
		return cleanup;
	}, []);

	const [mode, setMode] = useState<TimerMode>("work");
	const [isRunning, setIsRunning] = useState(false);
	const [isMinimized, setIsMinimized] = useState(true);
	const [completedPomodoros, setCompletedPomodoros] = useState(0);

	const activeBlock = blocks.find((block) =>
		isTimeInBlock(currentMinute, block.startMinute, block.endMinute)
	);

	const getDuration = useCallback(
		(currentMode: TimerMode): number => {
			switch (currentMode) {
				case "work": return settings.workDuration * 60;
				case "shortBreak": return settings.shortBreak * 60;
				case "longBreak": return settings.longBreak * 60;
			}
		},
		[settings]
	);

	const [timeLeft, setTimeLeft] = useState(() => getDuration("work"));

	useEffect(() => {
		const newDuration = getDuration(mode);
		queueMicrotask(() => {
			setTimeLeft(newDuration);
			setIsRunning(false);
		});
		// Re-run only on mode change or a *duration* setting change. Deliberately
		// not tied to the whole settings object, so toggling the tick sound (or
		// other non-duration settings) never resets or pauses a running timer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, settings.workDuration, settings.shortBreak, settings.longBreak]);

	const handleTimerComplete = useCallback(
		(auto: boolean = false) => {
			setIsRunning(false);
			let nextMode: TimerMode;
			if (mode === "work") {
				const newCount = completedPomodoros + 1;
				setCompletedPomodoros(newCount);
				nextMode = newCount % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak";
			} else {
				nextMode = "work";
			}
			setMode(nextMode);

			// Only alert on a timer that actually ran out, not on a manual skip.
			if (auto) {
				const nextLabel = nextMode === "work" ? activeBlock?.title || "Odak" : "Mola";
				void notifyTimerComplete(mode, nextLabel);
			}
		},
		[mode, completedPomodoros, settings.longBreakInterval, activeBlock]
	);

	// Timestamp-based countdown so the timer stays accurate while the tab is
	// backgrounded (setInterval is throttled, but the deadline math still holds).
	const endTimeRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isRunning) {
			endTimeRef.current = null;
			return;
		}
		endTimeRef.current = Date.now() + timeLeft * 1000;
		const tick = () => {
			const remaining = Math.max(0, Math.round(((endTimeRef.current ?? 0) - Date.now()) / 1000));
			setTimeLeft(remaining);
			if (remaining <= 0) {
				handleTimerComplete(true);
			}
		};
		const interval = setInterval(tick, 250);
		return () => clearInterval(interval);
		// timeLeft is intentionally excluded: the deadline is captured once at start.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isRunning, handleTimerComplete]);

	// Play the Swiss automatic watch tick in the background while the timer runs,
	// only when the user has enabled it. Always stop on pause/stop/unmount.
	useEffect(() => {
		if (isRunning && settings.tickSound) {
			startWatchTick();
		} else {
			stopWatchTick();
		}
		return () => stopWatchTick();
	}, [isRunning, settings.tickSound]);

	const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>(() =>
		getNotificationPermission()
	);

	const handleStart = useCallback(() => {
		const next = !isRunning;
		if (next) void requestNotificationPermission().then(setNotifyPermission);
		setIsRunning(next);
	}, [isRunning]);

	const handleToggleNotifications = useCallback(() => {
		void requestNotificationPermission().then(setNotifyPermission);
	}, []);

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const getModeIcon = () => {
		switch (mode) {
			case "work": return <Target size={18} />;
			case "shortBreak": return <Coffee size={18} />;
			case "longBreak": return <TreePalm size={18} />;
		}
	};

	return (
		<motion.div 
			layout
			className={`pomodoro-timer glass-panel ${isMinimized ? "minimized" : ""}`}
			initial={{ opacity: 0, y: 100 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="pomodoro-header">
				<div className="pomodoro-mode">
					<span className="mode-icon" style={{ color: mode === "work" ? "var(--primary)" : "var(--secondary)" }}>
						{getModeIcon()}
					</span>
					<div className="mode-text-group">
						<span className="pomodoro-title">Pomodoro</span>
						<span className="mode-label">{mode === "work" ? (activeBlock?.title || "Odak") : "Mola"}</span>
						{isMinimized && <span className="minimized-time">{formatTime(timeLeft)}</span>}
					</div>
				</div>
				<div className="pomodoro-header-actions">
					{isNotificationSupported() && notifyPermission !== "granted" && (
						<button
							className="icon-btn-sm"
							onClick={handleToggleNotifications}
							title={
								notifyPermission === "denied"
									? "Bildirimler engellendi — tarayıcı/işletim sistemi ayarlarından etkinleştirin"
									: "Tamamlanma bildirimlerini etkinleştir"
							}
							aria-label="Bildirimleri etkinleştir"
						>
							{notifyPermission === "denied" ? <BellOff size={14} /> : <Bell size={14} />}
						</button>
					)}
					<button
						className="icon-btn-sm"
						onClick={() => setIsMinimized(!isMinimized)}
					>
						{isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{!isMinimized && (
					<motion.div 
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="pomodoro-content"
					>
						<div className="timer-display-premium">
							<svg viewBox="0 0 100 100" className="timer-svg">
								<circle cx="50" cy="50" r="45" className="timer-base" />
								<motion.circle 
									cx="50" cy="50" r="45" 
									className="timer-progress"
									style={{ 
										strokeDasharray: "283",
										strokeDashoffset: 283 * (1 - timeLeft / getDuration(mode)),
										stroke: mode === "work" ? "var(--primary)" : "var(--secondary)"
									}}
								/>
							</svg>
							<div className="time-text">{formatTime(timeLeft)}</div>
						</div>

						<div className="pomodoro-controls">
							<button className="ctrl-btn main" onClick={handleStart}>
								{isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
							</button>
							<button className="ctrl-btn" onClick={() => { setIsRunning(false); setTimeLeft(getDuration(mode)); }}>
								<RotateCcw size={18} />
							</button>
							<button className="ctrl-btn" onClick={() => handleTimerComplete(false)}>
								<SkipForward size={18} />
							</button>
						</div>
						
						<div className="pomodoro-stats-premium">
							<span>Oturum {completedPomodoros + 1}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
