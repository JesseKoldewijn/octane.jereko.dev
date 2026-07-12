import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const STYLESHEET_LINK_RE = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi;

/** Prevent `</style>` inside CSS from terminating the HTML style element early. */
export function escapeCssForStyleTag(css: string): string {
	return css.replace(/<\/style/gi, '<\\/style');
}

function resolveStylesheetPath(clientDir: string, href: string): string {
	if (!href.startsWith('/')) {
		throw new Error(`[inline-stylesheets] Expected absolute href, got: ${href}`);
	}
	return join(clientDir, href.replace(/^\//, ''));
}

function hrefFromStylesheetLink(tag: string): string | null {
	const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
	return hrefMatch?.[1] ?? null;
}

export interface InlineStylesheetsOptions {
	cssCache?: Map<string, string>;
	logLabel?: string;
}

/** Replace `<link rel="stylesheet" href="/assets/...">` with inlined `<style>` blocks. */
export async function inlineStylesheetsInHtml(
	html: string,
	clientDir: string,
	options: InlineStylesheetsOptions = {},
): Promise<string> {
	const cssCache = options.cssCache ?? new Map();
	const logLabel = options.logLabel ?? 'HTML';

	return html.replace(STYLESHEET_LINK_RE, (tag) => {
		const href = hrefFromStylesheetLink(tag);
		if (!href) return tag;

		if (!cssCache.has(href)) {
			throw new Error(
				`[inline-stylesheets] Stylesheet not loaded for ${href}. Preload CSS into cssCache before inlining (${logLabel}).`,
			);
		}

		const css = cssCache.get(href);
		if (css === undefined) {
			throw new Error(`[inline-stylesheets] Stylesheet cache miss for ${href} (${logLabel}).`);
		}

		return `<style>${escapeCssForStyleTag(css)}</style>`;
	});
}

/** Load unique stylesheet hrefs referenced in HTML into a shared cache. */
export async function preloadStylesheetsFromHtml(
	html: string,
	clientDir: string,
	cssCache: Map<string, string> = new Map(),
): Promise<Map<string, string>> {
	const hrefs = new Set<string>();
	for (const tag of html.match(STYLESHEET_LINK_RE) ?? []) {
		const href = hrefFromStylesheetLink(tag);
		if (href) hrefs.add(href);
	}

	for (const href of hrefs) {
		if (cssCache.has(href)) continue;

		const cssPath = resolveStylesheetPath(clientDir, href);
		let css: string;
		try {
			css = await readFile(cssPath, 'utf8');
		} catch {
			throw new Error(`[inline-stylesheets] Missing stylesheet file for ${href} at ${cssPath}`);
		}

		cssCache.set(href, css);
		console.log(`[inline-stylesheets] loaded ${href} (${css.length} bytes)`);
	}

	return cssCache;
}

/** Preload and inline all stylesheet links in one pass. */
export async function inlineStylesheets(
	html: string,
	clientDir: string,
	options: InlineStylesheetsOptions = {},
): Promise<string> {
	const cssCache = options.cssCache ?? new Map();
	const logLabel = options.logLabel ?? 'HTML';

	await preloadStylesheetsFromHtml(html, clientDir, cssCache);
	const result = await inlineStylesheetsInHtml(html, clientDir, { cssCache, logLabel });

	if (result !== html) {
		console.log(`[inline-stylesheets] inlined styles into ${logLabel}`);
	}

	return result;
}
