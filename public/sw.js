/**
 * Oqloq Service Worker
 * Handles background notifications and brings the PWA to the foreground on click.
 */

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((windowClients) => {
				// If a window is already open, focus it
				for (const client of windowClients) {
					if ("focus" in client) {
						return client.focus();
					}
				}
				// Otherwise open a new window
				if (self.clients.openWindow) {
					return self.clients.openWindow("/");
				}
			})
	);
});
