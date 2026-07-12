import { makeRouter } from './router.ts';

export const clientRouter: ReturnType<typeof makeRouter> | null =
	typeof document === 'undefined' ? null : makeRouter({ isServer: true });

export default async function ensureClientRouterReady(ctx?: { url?: string }): Promise<void> {
	if (!clientRouter) return;

	const pathname = (ctx?.url ?? window.location.pathname).split('?')[0];
	if (clientRouter.state.location.pathname !== pathname) {
		await clientRouter.navigate({ to: pathname });
	}

	await clientRouter.load();
	for (let i = 0; i < 50; i++) {
		const matches = clientRouter.stores.matches.get?.() ?? clientRouter.stores.matches.value ?? [];
		if (matches.length > 0) return;
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
}
