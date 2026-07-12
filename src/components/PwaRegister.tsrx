import { useEffect } from 'octane';
import { unregisterAllServiceWorkers } from '@/lib/pwa-dev.ts';

const PWA_MIGRATION_VERSION = 'navigate-fallback-offline-path-v2';
const PWA_MIGRATION_KEY = 'jereko-pwa-migration';

let pwaClientInitStarted = false;

async function runPwaMigrationOnce(): Promise<boolean> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		return false;
	}
	try {
		if (localStorage.getItem(PWA_MIGRATION_KEY) === PWA_MIGRATION_VERSION) {
			return false;
		}
		const hadServiceWorker = (await navigator.serviceWorker.getRegistrations()).length > 0;
		await unregisterAllServiceWorkers();
		localStorage.setItem(PWA_MIGRATION_KEY, PWA_MIGRATION_VERSION);
		return hadServiceWorker;
	} catch {
		try {
			localStorage.setItem(PWA_MIGRATION_KEY, PWA_MIGRATION_VERSION);
		} catch {
			/* private mode */
		}
		return false;
	}
}

export function PwaRegister() @{
	useEffect(() => {
		if (pwaClientInitStarted) return;
		pwaClientInitStarted = true;

		void (async () => {
			if (import.meta.env.DEV) {
				await unregisterAllServiceWorkers();
				return;
			}

			const hadServiceWorker = await runPwaMigrationOnce();
			if (hadServiceWorker) {
				window.location.reload();
				return;
			}

			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		})();
	}, []);
}
