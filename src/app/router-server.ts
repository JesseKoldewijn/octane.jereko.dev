import { createMemoryHistory } from '@octanejs/tanstack-router';
import { makeRouter } from './router.ts';

export interface ServerRouterEntry {
	router: ReturnType<typeof makeRouter>;
	promise: Promise<void>;
	done: boolean;
}

const cache = new Map<string, ServerRouterEntry>();
const MAX_CACHED = 200;

export function normalizePathname(pathname: string): string {
	if (!pathname.startsWith('/')) pathname = '/' + pathname;
	if (pathname.length > 1 && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}
	return pathname;
}

export function getServerRouterEntry(pathname: string): ServerRouterEntry {
	const key = normalizePathname(pathname);
	let entry = cache.get(key);
	if (!entry) {
		if (cache.size >= MAX_CACHED) cache.clear();
		const history = createMemoryHistory({ initialEntries: [key] });
		const router = makeRouter({ history, isServer: true });
		const created: ServerRouterEntry = {
			router,
			done: false,
			promise: Promise.resolve(),
		};
		created.promise = router.load().then(() => {
			created.done = true;
		});
		cache.set(key, created);
		entry = created;
	}
	return entry;
}

export async function warmServerRouter(pathname: string): Promise<void> {
	await getServerRouterEntry(pathname).promise;
}
