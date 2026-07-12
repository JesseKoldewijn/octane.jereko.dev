import { useEffect } from 'octane';
import { unregisterAllServiceWorkers } from '@/lib/pwa-dev.ts';
import {
	ensureBuildMatchesOrReload,
	registerServiceWorkerWithAutoUpdate,
} from '@/lib/pwa-update.ts';

let pwaClientInitStarted = false;

export function PwaRegister() @{
	useEffect(() => {
		if (pwaClientInitStarted) return;
		pwaClientInitStarted = true;

		void (async () => {
			if (import.meta.env.DEV) {
				await unregisterAllServiceWorkers();
				return;
			}

			const reloaded = await ensureBuildMatchesOrReload();
			if (reloaded) return;

			await registerServiceWorkerWithAutoUpdate();
		})();
	}, []);
}
