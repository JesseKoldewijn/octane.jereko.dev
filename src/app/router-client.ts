import { makeRouter } from './router.ts';
import { unregisterAllServiceWorkers } from '@/lib/pwa-dev.ts';
import {
	ensureBuildMatchesOrReload,
	registerServiceWorkerWithAutoUpdate,
} from '@/lib/pwa-update.ts';

export const clientRouter: ReturnType<typeof makeRouter> | null =
	typeof document === 'undefined' ? null : makeRouter({ isServer: true });

let pwaClientInitStarted = false;

async function ensurePwaReady(): Promise<void> {
	if (pwaClientInitStarted) return;
	pwaClientInitStarted = true;

	if (import.meta.env.DEV) {
		await unregisterAllServiceWorkers();
		return;
	}

	const reloaded = await ensureBuildMatchesOrReload();
	if (reloaded) return;

	await registerServiceWorkerWithAutoUpdate();
}

export default async function ensureClientRouterReady(ctx?: { url?: string }): Promise<void> {
	if (!clientRouter) return;

	const pathname = (ctx?.url ?? window.location.pathname).split('?')[0];
	if (clientRouter.state.location.pathname !== pathname) {
		await clientRouter.navigate({ to: pathname });
	}

	await clientRouter.load();
	for (let i = 0; i < 50; i++) {
		const matches = clientRouter.stores.matches.get?.() ?? clientRouter.stores.matches.value ?? [];
		if (matches.length > 0) break;
		await new Promise((resolve) => setTimeout(resolve, 0));
	}

	await ensurePwaReady();
}
