import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Apply the persisted theme before rendering to avoid a flash of the wrong theme.
// Single source of truth shared with ThemeToggle: the "oqlock-theme" key + "theme-dark" class.
const savedTheme = localStorage.getItem("oqlock-theme");
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
	document.documentElement.classList.add("theme-dark");
}

// Register service worker for PWA support and background notifications
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js").catch((err) => {
		console.error("Service worker registration failed:", err);
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
