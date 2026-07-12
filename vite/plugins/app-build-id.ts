import type { Plugin } from 'vite';

export function resolveAppBuildId(): string {
	return process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? `${Date.now()}`;
}

export function buildInlinePwaBuildCheckScript(buildId: string): string {
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

export function appBuildIdPlugin(buildId: string, isDev: boolean): Plugin {
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
