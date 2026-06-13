/**
 * PomodoroTimer Component
 * Fixed position timer in bottom-left corner
 */

import React, { useState, useEffect, useCallback } from "react";
import { getPomodoroSettings, onPomodoroSettingsChange } from "../../services/pomodoroService";
import { useRoutineStore } from "../../hooks/useRoutineStore";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { isTimeInBlock } from "../../services/clockService";
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Target, Coffee, TreePalm } from "lucide-react";
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
	const [isMinimized, setIsMinimized] = useState(false);
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
	}, [mode, getDuration]);

	const handleTimerComplete = useCallback(() => {
		setIsRunning(false);
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
				if (prev <= 1) {
					handleTimerComplete();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [isRunning, timeLeft, handleTimerComplete]);

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
						<span className="mode-label">{mode === "work" ? (activeBlock?.title || "Focus") : "Break"}</span>
						{isMinimized && <span className="minimized-time">{formatTime(timeLeft)}</span>}
					</div>
				</div>
				<button
					className="icon-btn-sm"
					onClick={() => setIsMinimized(!isMinimized)}
				>
					{isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
				</button>
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
							<button className="ctrl-btn main" onClick={() => setIsRunning(!isRunning)}>
								{isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
							</button>
							<button className="ctrl-btn" onClick={() => setTimeLeft(getDuration(mode))}>
								<RotateCcw size={18} />
							</button>
							<button className="ctrl-btn" onClick={handleTimerComplete}>
								<SkipForward size={18} />
							</button>
						</div>
						
						<div className="pomodoro-stats-premium">
							<span>Session {completedPomodoros + 1}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
