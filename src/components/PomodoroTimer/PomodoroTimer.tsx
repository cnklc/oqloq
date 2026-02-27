/**
 * PomodoroTimer Component
 * Fixed position timer in bottom-left corner
 */

import React, { useState, useEffect, useCallback } from "react";
import { getPomodoroSettings, onPomodoroSettingsChange } from "../../services/pomodoroService";
import "./PomodoroTimer.css";

type TimerMode = "work" | "shortBreak" | "longBreak";

export const PomodoroTimer: React.FC = () => {
	const [settings, setSettings] = useState(() => getPomodoroSettings());

	// Listen for settings changes
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

	// Get duration for current mode
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

	// Reset timer when mode changes
	useEffect(() => {
		const newDuration = getDuration(mode);
		// Use queueMicrotask to avoid cascading updates warning
		queueMicrotask(() => {
			setTimeLeft(newDuration);
			setIsRunning(false);
		});
	}, [mode, getDuration]);

	const handleTimerComplete = useCallback(() => {
		setIsRunning(false);

		// Play notification sound (optional - browser support)
		try {
			const audio = new Audio(
				"data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIG2m98OScTgwOUKbh8LljHAU2kdfy0HotBSN1xe/akUELFFyz6uqnVRUMRaDh8r5sIgYtgs/z3Ik3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tF6LQUjdcXv2pFBCxRcs+rqp1YVDEWg4fK/bCIGLYLP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUXLPq6qdWFQxFoOHyv2wiBi2Cz/PdiTYIG2q98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUALFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz6eqnVhYNRZ/h8r9sIgYug8/z3Yk3CBxqvfDlnE4MDk+m4fC5Yx0GNZHX8tB5LQUjdcTv2pFBCxRbs+nqp1YWDUWf4fK/bCIGLoPP892JNwgcar3w5ZxODA5PpuHwuWMdBjWR1/LReS0FI3XE79qRQQsUW7Pp6qdWFg1Fn+Hyv2wiBi6Dz/PdiTcIHGq98OWcTgwOT6bh8LljHQY1kdfyz3ktBSN1xO/akUELFFuz"
			);
			audio.play().catch(() => {
				// Ignore audio play errors
			});
		} catch {
			// Ignore audio errors
		}

		// Show browser notification if permitted
		if ("Notification" in window && Notification.permission === "granted") {
			const title = mode === "work" ? "Break Time!" : "Work Time!";
			const body =
				mode === "work" ? "Great job! Time for a break." : "Break is over. Ready to focus?";
			new Notification(title, { body, icon: "/favicon.ico" });
		}

		// Switch to next mode
		if (mode === "work") {
			const newCount = completedPomodoros + 1;
			setCompletedPomodoros(newCount);

			// Long break after interval, otherwise short break
			if (newCount % settings.longBreakInterval === 0) {
				setMode("longBreak");
			} else {
				setMode("shortBreak");
			}
		} else {
			// After break, go back to work
			setMode("work");
		}
	}, [mode, completedPomodoros, settings.longBreakInterval]);

	// Timer countdown
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

	const toggleTimer = () => {
		// Request notification permission on first interaction
		if (!isRunning && "Notification" in window && Notification.permission === "default") {
			Notification.requestPermission();
		}
		setIsRunning(!isRunning);
	};

	const resetTimer = () => {
		setIsRunning(false);
		setTimeLeft(getDuration(mode));
	};

	const skipToNext = () => {
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
	};

	// Format time as MM:SS
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const getModeLabel = (): string => {
		switch (mode) {
			case "work":
				return "Focus";
			case "shortBreak":
				return "Short Break";
			case "longBreak":
				return "Long Break";
		}
	};

	const getModeIcon = (): string => {
		switch (mode) {
			case "work":
				return "🎯";
			case "shortBreak":
				return "☕";
			case "longBreak":
				return "🌴";
		}
	};

	return (
		<div className={`pomodoro-timer ${isMinimized ? "minimized" : ""}`}>
			<div className="pomodoro-header">
				<div className="pomodoro-mode">
					<span className="mode-icon">{getModeIcon()}</span>
					<span className="mode-label">{getModeLabel()}</span>
				</div>
				<button
					className="minimize-btn"
					onClick={() => setIsMinimized(!isMinimized)}
					aria-label={isMinimized ? "Expand" : "Minimize"}
				>
					{isMinimized ? "▲" : "▼"}
				</button>
			</div>

			{!isMinimized && (
				<>
					<div className="pomodoro-display">
						<div className="progress-ring">
							<svg viewBox="0 0 200 200">
								<circle
									cx="100"
									cy="100"
									r="90"
									fill="none"
									stroke="rgba(255, 180, 214, 0.2)"
									strokeWidth="10"
								/>
								<circle
									cx="100"
									cy="100"
									r="90"
									fill="none"
									stroke="#ffb4d6"
									strokeWidth="10"
									strokeLinecap="round"
									strokeDasharray={`${2 * Math.PI * 90}`}
									strokeDashoffset={2 * Math.PI * 90 * (1 - timeLeft / getDuration(mode))}
									transform="rotate(-90 100 100)"
									style={{ transition: isRunning ? "none" : "stroke-dashoffset 0.3s" }}
								/>
							</svg>
						</div>
						<div className={`time-display ${isRunning ? "running" : ""}`}>
							{formatTime(timeLeft)}
						</div>
					</div>

					<div className="pomodoro-controls">
						<button
							className="control-btn primary"
							onClick={toggleTimer}
							aria-label={isRunning ? "Pause" : "Start"}
						>
							{isRunning ? "⏸" : "▶"}
						</button>
						<button className="control-btn secondary" onClick={resetTimer} aria-label="Reset">
							↻
						</button>
						<button className="control-btn secondary" onClick={skipToNext} aria-label="Skip">
							⏭
						</button>
					</div>

					<div className="pomodoro-stats">
						<span>Completed: {completedPomodoros}</span>
					</div>
				</>
			)}
		</div>
	);
};
