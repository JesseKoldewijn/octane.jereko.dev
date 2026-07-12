import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLayoutWrapper, createPropsWrapper } from './component-wrappers.js';
import {
	get_component_export,
	get_route_entry_export_name,
	get_route_entry_path,
} from '../routes.js';

/**
 * @typedef {import('@octanejs/vite-plugin').Context} Context
 * @typedef {import('@octanejs/vite-plugin').RenderRoute} RenderRoute
 * @typedef {import('@octanejs/vite-plugin').ResolvedOctaneConfig} ResolvedOctaneConfig
 * @typedef {import('vite').ViteDevServer} ViteDevServer
 */

/**
 * @typedef {import('octane/static').RenderResult} RenderResult
 */

/**
 * Handle SSR rendering for a RenderRoute (dev).
 * Uses buffered `prerender` so TanStack Router Suspense boundaries resolve fully
 * before the HTML is sent (streaming SSR leaves nested router matches empty).
 *
 * @param {RenderRoute} route
 * @param {Context} context
 * @param {ViteDevServer} vite
 * @param {ResolvedOctaneConfig} [octaneConfig]
 * @returns {Promise<Response>}
 */
export async function handleRenderRoute(route, context, vite, octaneConfig) {
	try {
		if (!(/** @type {any} */ (globalThis).rpc_modules)) {
			/** @type {any} */ (globalThis).rpc_modules = new Map();
		}

		const { prerender } = await vite.ssrLoadModule('octane/static');

		const entryPath = get_route_entry_path(route.entry);
		const pageModule = await vite.ssrLoadModule(/** @type {string} */ (entryPath));
		const PageComponent = get_component_export(
			pageModule,
			get_route_entry_export_name(route.entry),
		);

		if (!PageComponent) {
			throw new Error(`No component found for route ${route.path}`);
		}

		let RootComponent;
		const requestUrl = context.url.pathname + context.url.search;
		const pageProps = { params: context.params, url: requestUrl };

		if (route.layout) {
			const layoutModule = await vite.ssrLoadModule(route.layout);
			const LayoutComponent = get_component_export(layoutModule, undefined);

			if (!LayoutComponent) {
				throw new Error(`No default export found in ${route.layout}`);
			}

			RootComponent = createLayoutWrapper(
				/** @type {any} */ (LayoutComponent),
				/** @type {any} */ (PageComponent),
				pageProps,
			);
		} else {
			RootComponent = createPropsWrapper(/** @type {any} */ (PageComponent), pageProps);
		}

		/** @type {RenderResult} */
		const { html: body, css } = await prerender(RootComponent);
		const cssContent = css || '';

		const routeData = JSON.stringify({
			entry: entryPath,
			exportName: get_route_entry_export_name(route.entry) ?? null,
			layout: route.layout ?? null,
			routeIndex: getRenderRouteIndex(octaneConfig, route),
			params: context.params,
			url: requestUrl,
			preHydrate: octaneConfig?.router.preHydrate ?? null,
		});
		const headContent = [
			cssContent,
			`<script id="__octane_data" type="application/json">${escapeScript(routeData)}</script>`,
		]
			.filter(Boolean)
			.join('\n');

		const templatePath = join(vite.config.root, 'index.html');
		let template = await readFile(templatePath, 'utf-8');
		template = await vite.transformIndexHtml(context.url.pathname, template);

		let html = template.replace('<!--ssr-head-->', headContent).replace('<!--ssr-body-->', body);

		const hydrationScript = `<script type="module" src="/@id/virtual:octane-hydrate"></script>`;
		html = html.replace('</body>', `${hydrationScript}\n</body>`);

		return new Response(html, {
			status: route.status ?? 200,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	} catch (error) {
		console.error('[octane] SSR render error:', error);

		const errorHtml = generateErrorHtml(error, route);
		return new Response(errorHtml, {
			status: 500,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	}
}

/**
 * @param {ResolvedOctaneConfig | undefined} config
 * @param {RenderRoute} route
 * @returns {number | undefined}
 */
function getRenderRouteIndex(config, route) {
	if (!config) {
		return undefined;
	}
	const renderRoutes = config.router.routes.filter((r) => r.type === 'render');
	const index = renderRoutes.indexOf(route);
	return index === -1 ? undefined : index;
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeScript(str) {
	return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

/**
 * @param {unknown} error
 * @param {RenderRoute} route
 * @returns {string}
 */
function generateErrorHtml(error, route) {
	const message = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SSR Error</title>
<style>
body { font-family: system-ui, sans-serif; padding: 2rem; background: #1a1a1a; color: #fff; }
h1 { color: #ff6b6b; }
pre { background: #2d2d2d; padding: 1rem; border-radius: 4px; overflow-x: auto; }
.route { color: #888; }
</style>
</head>
<body>
<h1>SSR Render Error</h1>
<p class="route">Route: ${route.path} → ${route.entry}</p>
<pre>${escapeHtml(message)}</pre>
${stack ? `<pre>${escapeHtml(stack)}</pre>` : ''}
</body>
</html>`;
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
