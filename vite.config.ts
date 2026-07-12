import tailwindcss from '@tailwindcss/vite';
import { octane } from '@octanejs/vite-plugin';
import { defineConfig } from 'vite';
import path from 'node:path';

import { appBuildIdPlugin, resolveAppBuildId } from './vite/plugins/app-build-id.ts';
import { clientOnlySsrStubs } from './vite/plugins/client-only-ssr-stubs.ts';
import { createPwaPlugin } from './vite/plugins/pwa.ts';
import { octaneServerAlias } from './vite/plugins/octane-server-alias.ts';

export default defineConfig(({ command }) => {
	const isDev = command === 'serve';
	const appBuildId = resolveAppBuildId();

	return {
		appType: 'custom',
		publicDir: 'public',
		plugins: [
			octaneServerAlias(),
			clientOnlySsrStubs(),
			appBuildIdPlugin(appBuildId, isDev),
			tailwindcss(),
			octane(),
			...(isDev ? [] : [createPwaPlugin()]),
		],

		define: {
			__APP_BUILD_ID__: JSON.stringify(isDev ? 'development' : appBuildId),
		},

		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},

		ssr: {
			noExternal: [/^octane($|\/)/, /^@octanejs\/(?!motion)/],
			external: ['@octanejs/motion', 'motion'],
		},

		optimizeDeps: {
			exclude: ['octane', '@octanejs/tanstack-router', '@octanejs/vite-plugin'],
		},

		build: {
			target: 'baseline-widely-available',
			cssCodeSplit: false,
			modulePreload: {
				resolveDependencies(_filename, deps, context) {
					if (context.hostType !== 'js') return deps;
					// The hydrate entry already statically imports the framework chunk.
					// Preloading it again for route chunks duplicates network work in Lighthouse.
					return deps.filter(
						(dep) =>
							!dep.includes('/framework-') &&
							!dep.includes('/framework.') &&
							!dep.endsWith('/framework'),
					);
				},
			},
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('/node_modules/octane/') || id.includes('/node_modules/@octanejs/')) {
							return 'framework';
						}
					},
				},
			},
		},
	};
});
