import tailwindcss from '@tailwindcss/vite';
import { octane } from '@octanejs/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type Plugin } from 'vite';
import path from 'node:path';

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
