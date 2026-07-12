import { unregisterAllServiceWorkers } from '@/lib/pwa-dev.ts';

export const APP_BUILD_ID_STORAGE_KEY = 'jereko-app-build-id';

export type BuildIdCheckResult = 'first-visit' | 'match' | 'mismatch';

/** Compare stored and current deploy IDs (pure, testable). */
export function compareBuildIds(
	stored: string | null,
	current: string,
): BuildIdCheckResult {
	if (stored === null) return 'first-visit';
	return stored === current ? 'match' : 'mismatch';
}

export function getAppBuildId(): string {
	return __APP_BUILD_ID__;
}

function readStoredBuildId(): string | null {
	try {
		return localStorage.getItem(APP_BUILD_ID_STORAGE_KEY);
	} catch {
		return null;
	}
}

function writeStoredBuildId(buildId: string): void {
	try {
		localStorage.setItem(APP_BUILD_ID_STORAGE_KEY, buildId);
	} catch {
		/* private mode */
	}
}

/**
 * When the deploy ID changed, purge SW/caches and reload once.
 * Returns true if a reload was triggered (caller should stop further init).
 */
export async function ensureBuildMatchesOrReload(): Promise<boolean> {
	if (import.meta.env.DEV) return false;

	const currentBuildId = getAppBuildId();
	const storedBuildId = readStoredBuildId();
	const check = compareBuildIds(storedBuildId, currentBuildId);

	if (check === 'first-visit') {
		writeStoredBuildId(currentBuildId);
		return false;
	}

	if (check === 'match') {
		return false;
	}

	writeStoredBuildId(currentBuildId);
	await unregisterAllServiceWorkers();
	window.location.reload();
	return true;
}

const SW_UPDATE_POLL_MS = 60 * 60 * 1000;

/** Register the production service worker and poll for updates. */
export async function registerServiceWorkerWithAutoUpdate(): Promise<void> {
	const { registerSW } = await import('virtual:pwa-register');

	registerSW({
		immediate: true,
		onRegisteredSW(_swScriptUrl, registration) {
			if (!registration) return;

			void registration.update();

			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					void registration.update();
				}
			});

			window.setInterval(() => {
				void registration.update();
			}, SW_UPDATE_POLL_MS);
		},
	});
}
