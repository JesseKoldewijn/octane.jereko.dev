import { defineConfig, RenderRoute, type Middleware } from '@octanejs/vite-plugin';

import { PRERENDER_ROUTES } from './src/config/routes.ts';

const warmRouter: Middleware = async (context, next) => {
	const { warmServerRouter } = await import('./src/app/router-server.ts');
	await warmServerRouter(context.url.pathname);
	return next();
};

const injectPageMeta: Middleware = async (context, next) => {
	const { injectPageMeta: inject } = await import('./src/app/inject-page-meta.ts');
	return inject(context, next);
};

const routeBefore = [warmRouter, injectPageMeta] as const;

const ENTRY = ['App', '/src/app/App.tsrx'] as const;

/** Patched vite-plugin supports HTTP status on catch-all routes; upstream types lag. */
type RenderRouteOptions = ConstructorParameters<typeof RenderRoute>[0] & {
	status?: number;
};

/** preHydrate is supported at runtime; upstream OctaneConfigOptions types lag. */
type RouterConfig = NonNullable<Parameters<typeof defineConfig>[0]['router']> & {
	preHydrate?: string;
};

export default defineConfig({
	router: {
		routes: [
			...PRERENDER_ROUTES.map(
				(path) => new RenderRoute({ path, entry: ENTRY, before: [...routeBefore] }),
			),
			new RenderRoute({
				path: '/*splat',
				entry: ENTRY,
				before: [...routeBefore],
				status: 404,
			} as RenderRouteOptions),
		],
		preHydrate: '/src/app/router-client.ts',
	} as RouterConfig,
});
