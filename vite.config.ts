import tailwindcss from '@tailwindcss/vite';
import { octane } from '@octanejs/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type Plugin } from 'vite';
import path from 'node:path';

const appBuildId =
	process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? `${Date.now()}`;

function buildInlinePwaBuildCheckScript(buildId: string): string {
	const key = 'jereko-app-build-id';
	return `(function () {
	try {
		var buildId = ${JSON.stringify(buildId)};
		var key = ${JSON.stringify(key)};
		var stored = localStorage.getItem(key);
		if (!stored) {
			localStorage.setItem(key, buildId);
			return;
		}
		if (stored === buildId) return;
		localStorage.setItem(key, buildId);
		var done = function () {
			location.reload();
		};
		var chain = Promise.resolve();
		if ('serviceWorker' in navigator) {
			chain = chain
				.then(function () {
					return navigator.serviceWorker.getRegistrations();
				})
				.then(function (regs) {
					return Promise.all(regs.map(function (r) {
						return r.unregister();
					}));
				});
		}
		if ('caches' in window) {
			chain = chain
				.then(function () {
					return caches.keys();
				})
				.then(function (keys) {
					return Promise.all(
						keys
							.filter(function (k) {
								return (
									k.indexOf('workbox') !== -1 ||
									k.indexOf('precache') !== -1 ||
									k.indexOf('google-offline') === 0
								);
							})
							.map(function (k) {
								return caches.delete(k);
							}),
					);
				});
		}
		chain.then(done).catch(done);
	} catch (e) {
		/* private mode or storage blocked */
	}
})();`;
}

function appBuildIdPlugin(buildId: string, isDev: boolean): Plugin {
	return {
		name: 'app-build-id',
		transformIndexHtml(html) {
			if (isDev) {
				return html.replace('<!--app-build-id-->', '');
			}

			const meta = `<meta name="app-build-id" content="${buildId}" />`;
			const script = `<script>${buildInlinePwaBuildCheckScript(buildId)}</script>`;
			return html.replace('<!--app-build-id-->', `${meta}\n\t\t${script}`);
		},
	};
}

function octaneServerAlias(): Plugin {
	return {
		name: 'octane-ssr-server-alias',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!options?.ssr || source !== 'octane') return null;
			const resolved = await this.resolve('octane/server', importer, { skipSelf: true });
			return resolved?.id ?? null;
		},
	};
}

function clientOnlySsrStubs(): Plugin {
	const textGenStub = path.resolve(__dirname, 'scripts/stubs/text-gen-ssr-stub.js');
	return {
		name: 'client-only-ssr-stubs',
		enforce: 'pre',
		resolveId(source, _importer, options) {
			if (!options?.ssr) return null;
			if (source.endsWith('text-gen.tsrx') || source.includes('animated/text-gen.tsrx')) {
				return textGenStub;
			}
			return null;
		},
	};
}

export default defineConfig(({ command }) => {
	const isDev = command === 'serve';

	return {
		appType: 'custom',
		publicDir: 'public',
		plugins: [
			octaneServerAlias(),
			clientOnlySsrStubs(),
			appBuildIdPlugin(appBuildId, isDev),
			tailwindcss(),
			octane(),
			...(isDev
				? []
				: [
						VitePWA({
							injectRegister: null,
							outDir: 'dist/client',
							registerType: 'autoUpdate',
							manifest: {
								name: 'Jereko',
								short_name: 'Jereko',
								description: 'Jesse Koldewijn — personal site: projects, experience, and events.',
								lang: 'en',
								start_url: '/',
								scope: '/',
								display: 'standalone',
								theme_color: '#000000',
								background_color: '#fafafa',
								icons: [
									{
										src: '/favicons/android-chrome-192x192.png',
										sizes: '192x192',
										type: 'image/png',
										purpose: 'any',
									},
									{
										src: '/favicons/android-chrome-512x512.png',
										sizes: '512x512',
										type: 'image/png',
										purpose: 'any',
									},
									{
										src: '/favicons/android-chrome-512x512.png',
										sizes: '512x512',
										type: 'image/png',
										purpose: 'maskable',
									},
								],
							},
							workbox: {
								// SSR: do not use navigateFallback — it registers a NavigationRoute
								// that serves the fallback URL from precache for every navigation
								// (SPA mode), bypassing the server and showing offline.html online.
								navigateFallback: null,
								globPatterns: ['**/*.{js,css,ico,png,svg,webp,avif,woff2}'],
								globIgnores: ['**/404.html', '404.html'],
								cleanupOutdatedCaches: true,
								skipWaiting: true,
								clientsClaim: true,
							},
						}),
					]),
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
			target: 'esnext',
		},
	};
});
