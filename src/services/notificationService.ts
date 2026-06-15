/**
 * Notification Service
 * Handles desktop/PWA notifications and an audible alert when a timer completes.
 *
 * Notifications are shown through the service worker registration so that clicking
 * them focuses (or opens) the installed app — see public/sw.js `notificationclick`.
 */

type AlertKind = "work" | "shortBreak" | "longBreak";

const NOTIFICATION_TITLES: Record<AlertKind, string> = {
	work: "Focus session complete",
	shortBreak: "Break over",
	longBreak: "Long break over",
};

const NOTIFICATION_BODIES: Record<AlertKind, string> = {
	work: "Time for a break — step away for a moment.",
	shortBreak: "Back to focus. Let's get going.",
	longBreak: "Recharged? Time to focus again.",
};

/**
 * Whether the browser exposes the Notification API at all.
 */
export const isNotificationSupported = (): boolean =>
	typeof window !== "undefined" && "Notification" in window;

/**
 * Current notification permission, or "denied" when the API is unavailable.
 */
export const getNotificationPermission = (): NotificationPermission =>
	isNotificationSupported() ? Notification.permission : "denied";

/**
 * Request permission to show notifications. Safe to call repeatedly; resolves to
 * the effective permission. Best called from a user gesture (e.g. starting the timer).
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
	if (!isNotificationSupported()) return "denied";
	if (Notification.permission !== "default") return Notification.permission;
	try {
		return await Notification.requestPermission();
	} catch (error) {
		console.error("Notification permission request failed:", error);
		return "denied";
	}
};

/**
 * Play a short two-tone chime using the Web Audio API.
 * Generated in code so no audio asset needs to ship.
 */
export const playAlertSound = (): void => {
	try {
		const AudioCtx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioCtx) return;

		const ctx = new AudioCtx();
		// Two ascending notes for a pleasant "ding-dong" alert.
		const notes = [
			{ freq: 880, start: 0, duration: 0.18 },
			{ freq: 1320, start: 0.16, duration: 0.32 },
		];

		for (const note of notes) {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = note.freq;

			const startAt = ctx.currentTime + note.start;
			const endAt = startAt + note.duration;
			// Quick attack, smooth exponential release to avoid clicks.
			gain.gain.setValueAtTime(0.0001, startAt);
			gain.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(startAt);
			osc.stop(endAt);
		}

		// Release the context once the sound has finished.
		window.setTimeout(() => ctx.close().catch(() => {}), 800);
	} catch (error) {
		console.error("Failed to play alert sound:", error);
	}
};

/**
 * Fire a notification (via the service worker so clicks focus the app) and play the
 * alert sound. The next-mode label tells the user what comes next.
 */
export const notifyTimerComplete = async (
	completedMode: AlertKind,
	nextLabel?: string
): Promise<void> => {
	playAlertSound();

	if (!isNotificationSupported() || Notification.permission !== "granted") return;

	const title = NOTIFICATION_TITLES[completedMode];
	const body = nextLabel
		? `${NOTIFICATION_BODIES[completedMode]} Up next: ${nextLabel}.`
		: NOTIFICATION_BODIES[completedMode];

	const options: NotificationOptions = {
		body,
		icon: "/vite.svg",
		badge: "/vite.svg",
		tag: "oqloq-pomodoro",
		requireInteraction: true,
	};

	try {
		// Prefer the service worker registration: its notificationclick handler
		// focuses/opens the app even when this tab is in the background.
		const registration =
			"serviceWorker" in navigator ? await navigator.serviceWorker.ready : null;
		if (registration) {
			await registration.showNotification(title, options);
		} else {
			new Notification(title, options);
		}
	} catch (error) {
		console.error("Failed to show notification:", error);
	}
};
