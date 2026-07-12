/** Remove any registered service workers (dev must never run a production SW). */
export async function unregisterAllServiceWorkers() {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
		return;
	}
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.all(registrations.map((registration) => registration.unregister()));
	if ('caches' in window) {
		const keys = await caches.keys();
		await Promise.all(
			keys
				.filter(
					(name) =>
						name.includes('workbox') ||
						name.includes('precache') ||
						name.startsWith('google-offline'),
				)
				.map((name) => caches.delete(name)),
		);
	}
}
