/**
 * Pomodoro Service
 * Manages pomodoro timer settings and state
 */

export interface PomodoroSettings {
	workDuration: number; // in minutes
	shortBreak: number; // in minutes
	longBreak: number; // in minutes
	longBreakInterval: number; // after how many pomodoros
}

const POMODORO_SETTINGS_KEY = "pomodoroSettings";
const SETTINGS_CHANGE_EVENT = "pomodoroSettingsChanged";

const DEFAULT_SETTINGS: PomodoroSettings = {
	workDuration: 25,
	shortBreak: 5,
	longBreak: 15,
	longBreakInterval: 4,
};

/**
 * Get pomodoro settings from localStorage
 */
export const getPomodoroSettings = (): PomodoroSettings => {
	try {
		const stored = localStorage.getItem(POMODORO_SETTINGS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return { ...DEFAULT_SETTINGS, ...parsed };
		}
	} catch (error) {
		console.error("Error loading pomodoro settings:", error);
	}
	return DEFAULT_SETTINGS;
};

/**
 * Save pomodoro settings to localStorage
 */
export const savePomodoroSettings = (settings: PomodoroSettings): void => {
	try {
		localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
		// Dispatch custom event to notify listeners
		window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: settings }));
	} catch (error) {
		console.error("Error saving pomodoro settings:", error);
	}
};

/**
 * Listen for pomodoro settings changes
 */
export const onPomodoroSettingsChange = (
	callback: (settings: PomodoroSettings) => void
): (() => void) => {
	const handler = (event: Event) => {
		const customEvent = event as CustomEvent<PomodoroSettings>;
		callback(customEvent.detail);
	};
	window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
	return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
};

/**
 * Reset pomodoro settings to defaults
 */
export const resetPomodoroSettings = (): PomodoroSettings => {
	savePomodoroSettings(DEFAULT_SETTINGS);
	return DEFAULT_SETTINGS;
};
