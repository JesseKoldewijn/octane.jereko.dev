import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export function createPwaPlugin(): Plugin[] {
	return VitePWA({
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
			globPatterns: ['**/*.{js,ico,png,svg,webp,avif,woff2}'],
			globIgnores: ['**/404.html', '404.html'],
			cleanupOutdatedCaches: true,
			skipWaiting: true,
			clientsClaim: true,
		},
	});
}
