/**
 * Theme Service
 * Manages application theme (light/dark/auto)
 */

export type ThemeMode = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "theme";

/**
 * Get the current theme from localStorage or default to "light"
 */
export const getTheme = (): ThemeMode => {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}
	return "light";
};

/**
 * Set theme and apply it to the document
 */
export const setTheme = (theme: ThemeMode): void => {
	localStorage.setItem(THEME_STORAGE_KEY, theme);
	applyTheme(theme);
};

/**
 * Get system preference for dark mode
 */
const getSystemPreference = (): "light" | "dark" => {
	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
		return "dark";
	}
	return "light";
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme: ThemeMode): void => {
	const root = document.documentElement;

	// Remove existing theme classes
	root.classList.remove("theme-light", "theme-dark");

	// Determine actual theme to apply
	let actualTheme: "light" | "dark";
	if (theme === "auto") {
		actualTheme = getSystemPreference();
	} else {
		actualTheme = theme;
	}

	// Apply theme class
	root.classList.add(`theme-${actualTheme}`);
};

/**
 * Initialize theme on app start
 */
export const initializeTheme = (): void => {
	const theme = getTheme();
	applyTheme(theme);

	// Listen for system theme changes when in auto mode
	if (window.matchMedia) {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", () => {
			const currentTheme = getTheme();
			if (currentTheme === "auto") {
				applyTheme("auto");
			}
		});
	}
};
