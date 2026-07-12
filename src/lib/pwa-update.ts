import { Workbox } from 'workbox-window';

import { unregisterAllServiceWorkers } from '@/lib/pwa-dev.ts';

export const APP_BUILD_ID_STORAGE_KEY = 'jereko-app-build-id';

export type BuildIdCheckResult = 'first-visit' | 'match' | 'mismatch';

/** Compare stored and current deploy IDs (pure, testable). */
export function compareBuildIds(stored: string | null, current: string): BuildIdCheckResult {
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

let controllerChangeReloadScheduled = false;

function scheduleReloadOnServiceWorkerControlChange(): void {
	if (controllerChangeReloadScheduled || !('serviceWorker' in navigator)) return;
	controllerChangeReloadScheduled = true;

	navigator.serviceWorker.addEventListener('controllerchange', () => {
		window.location.reload();
	});
}

async function safeServiceWorkerUpdate(registration: ServiceWorkerRegistration): Promise<void> {
	try {
		await registration.update();
	} catch {
		/* deploy window or stale registration — build-id check handles hard resets */
	}
}

/** Register the production service worker and poll for updates. */
export async function registerServiceWorkerWithAutoUpdate(): Promise<void> {
	scheduleReloadOnServiceWorkerControlChange();

	if (!('serviceWorker' in navigator)) return;

	const workbox = new Workbox('/sw.js', { scope: '/' });

	workbox.addEventListener('waiting', () => {
		void workbox.messageSkipWaiting();
	});

	try {
		const registration = await workbox.register();
		if (!registration) return;

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				void safeServiceWorkerUpdate(registration);
			}
		});

		window.setInterval(() => {
			void safeServiceWorkerUpdate(registration);
		}, SW_UPDATE_POLL_MS);
	} catch {
		/* offline, blocked, or missing sw.js during deploy */
	}
}
