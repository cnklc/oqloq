import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initializeTheme } from "./services/themeService";

// Initialize theme before rendering
initializeTheme();

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
