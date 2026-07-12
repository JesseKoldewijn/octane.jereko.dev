/**
 * Production fetch-handler factory for octane apps.
 */

import { createRouter } from './router.js';
import { createContext, runMiddlewareChain } from './middleware.js';
import { createLayoutWrapper, createPropsWrapper } from './component-wrappers.js';
import {
	get_component_export,
	get_route_entry_export_name,
	get_route_entry_id,
	get_route_entry_path,
} from '../routes.js';
import {
	patch_global_fetch,
	build_rpc_lookup,
	is_rpc_request,
	handle_rpc_request,
} from '@ripple-ts/adapter/rpc';

export { resolveOctaneConfig } from '../load-config.js';

/**
 * @param {import('@octanejs/vite-plugin/types/production.d.ts').ServerManifest} manifest
 * @param {import('@octanejs/vite-plugin/types/production.d.ts').HandlerOptions} options
 */
export function createHandler(manifest, options) {
	const { render, htmlTemplate, executeServerFunction } = options;
	const router = createRouter(manifest.routes);
	const globalMiddlewares = manifest.middlewares;
	const trustProxy = manifest.trustProxy ?? false;
	const clientAssets = manifest.clientAssets || {};
	const runtime = manifest.runtime;

	const rpcLookup = manifest.rpcModules
		? build_rpc_lookup(manifest.rpcModules, runtime.hash)
		: new Map();

	const asyncContext = runtime.createAsyncContext();
	const fetchHandle = patch_global_fetch(asyncContext);

	const handler = async function handler(request) {
		const url = new URL(request.url);
		const method = request.method;

		if (is_rpc_request(url.pathname)) {
			return handle_rpc_request(request, {
				resolveFunction(hash) {
					const entry = rpcLookup.get(hash);
					if (!entry) return null;
					const fn = entry.serverObj[entry.funcName];
					return typeof fn === 'function' ? fn : null;
				},
				executeServerFunction,
				asyncContext,
				trustProxy,
			});
		}

		const match = router.match(method, url.pathname);
		if (!match) {
			return new Response('Not Found', { status: 404 });
		}

		const context = createContext(request, match.params);

		try {
			if (match.route.type === 'render') {
				return await handleRenderRoute(
					match.route,
					context,
					manifest,
					globalMiddlewares,
					render,
					htmlTemplate,
					clientAssets,
				);
			}
			return await handleServerRoute(match.route, context, globalMiddlewares);
		} catch (error) {
			console.error('[octane] Request error:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	};

	fetchHandle.set_handler(handler);
	return handler;
}

/**
 * @param {import('@octanejs/vite-plugin').RenderRoute} route
 * @param {import('@octanejs/vite-plugin').Context} context
 * @param {import('@octanejs/vite-plugin/types/production.d.ts').ServerManifest} manifest
 * @param {import('@octanejs/vite-plugin').Middleware[]} globalMiddlewares
 * @param {import('@octanejs/vite-plugin/types/production.d.ts').HandlerOptions['render']} render
 * @param {string} htmlTemplate
 * @param {Record<string, import('@octanejs/vite-plugin/types/production.d.ts').ClientAssetEntry>} clientAssets
 */
async function handleRenderRoute(
	route,
	context,
	manifest,
	globalMiddlewares,
	render,
	htmlTemplate,
	clientAssets,
) {
	const renderHandler = async () => {
		const entryId = get_route_entry_id(route.entry);
		const entryPath = get_route_entry_path(route.entry);
		const PageComponent = entryId ? manifest.components[entryId] : null;
		if (!PageComponent) {
			throw new Error(`Component not found for route ${route.path}`);
		}

		const requestUrl = context.url.pathname + context.url.search;
		const pageProps = { params: context.params, url: requestUrl };

		let RootComponent;
		if (route.layout && manifest.layouts[route.layout]) {
			const LayoutComponent = manifest.layouts[route.layout];
			RootComponent = createLayoutWrapper(LayoutComponent, PageComponent, pageProps);
		} else {
			RootComponent = createPropsWrapper(PageComponent, pageProps);
		}

		const preloadTags = [];
		const entryAssets = entryPath ? clientAssets[entryPath] : undefined;

		if (entryAssets?.css) {
			for (const cssFile of entryAssets.css) {
				preloadTags.push(`<link rel="stylesheet" href="/${cssFile}">`);
			}
		}
		if (entryAssets?.js) {
			preloadTags.push(`<link rel="modulepreload" href="/${entryAssets.js}">`);
		}

		const hydrateAsset = clientAssets.__hydrate_js;
		if (hydrateAsset?.js) {
			preloadTags.push(`<link rel="modulepreload" href="/${hydrateAsset.js}">`);
		}

		const routeData = JSON.stringify({
			entry: entryPath,
			exportName: get_route_entry_export_name(route.entry) ?? null,
			layout: route.layout ?? null,
			routeIndex: getRenderRouteIndex(manifest.routes, route),
			params: context.params,
			url: requestUrl,
			preHydrate: manifest.preHydrate ?? null,
		});
		const routeDataScript = `<script id="__octane_data" type="application/json">${escapeScript(routeData)}</script>`;

		const { html: body, css } = await render(RootComponent);
		const headContent = [css, ...preloadTags, routeDataScript].filter(Boolean).join('\n');

		const html = htmlTemplate
			.replace('<!--ssr-head-->', headContent)
			.replace('<!--ssr-body-->', body);

		return new Response(html, {
			status: route.status ?? 200,
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	};

	return runMiddlewareChain(context, globalMiddlewares, route.before || [], renderHandler, []);
}

/**
 * @param {import('@octanejs/vite-plugin').Route[]} routes
 * @param {import('@octanejs/vite-plugin').RenderRoute} route
 */
function getRenderRouteIndex(routes, route) {
	const renderRoutes = routes.filter((r) => r.type === 'render');
	const index = renderRoutes.indexOf(route);
	return index === -1 ? undefined : index;
}

/**
 * @param {import('@octanejs/vite-plugin').ServerRoute} route
 * @param {import('@octanejs/vite-plugin').Context} context
 * @param {import('@octanejs/vite-plugin').Middleware[]} globalMiddlewares
 */
async function handleServerRoute(route, context, globalMiddlewares) {
	const handler = async () => route.handler(context);
	return runMiddlewareChain(
		context,
		globalMiddlewares,
		route.before || [],
		handler,
		route.after || [],
	);
}

/**
 * @param {string} str
 */
function escapeScript(str) {
	return str.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}
