#!/usr/bin/env bun
/**
 * Prerender all routes to static HTML using the production server handler.
 * Runs after vite build; dist/server/entry.js is build-time only.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PRERENDER_ROUTES } from '../src/config/routes.ts';
import { inlineStylesheets } from './lib/inline-stylesheets.ts';
import { htmlOutputPath } from './lib/static-paths.ts';
import { stripModulepreloadLinks } from './lib/strip-modulepreload.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(root, 'dist/client');
const serverEntry = join(root, 'dist/server/entry.js');
const ORIGIN = 'http://127.0.0.1';
const cssCache = new Map<string, string>();

/** Remove duplicate stylesheet links (Vite index.html + ssr-head injection). */
function dedupeStylesheetLinks(html: string): string {
	const seen = new Set<string>();
	return html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (tag) => {
		const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
		if (!hrefMatch) return tag;
		const href = hrefMatch[1];
		if (seen.has(href)) return '';
		seen.add(href);
		return tag;
	});
}

const { handler } = (await import(serverEntry)) as {
	handler: (request: Request) => Promise<Response>;
};

async function prerenderRoute(routePath: string): Promise<void> {
	const response = await handler(new Request(`${ORIGIN}${routePath}`));
	let html = await response.text();

	if (response.status !== 200) {
		throw new Error(
			`[prerender-static] ${routePath} returned ${response.status}:\n${html.slice(0, 500)}`,
		);
	}

	const outPath = htmlOutputPath(clientDir, routePath);
	html = dedupeStylesheetLinks(html);
	html = stripModulepreloadLinks(html);
	html = await inlineStylesheets(html, clientDir, {
		cssCache,
		logLabel: outPath.replace(root + '/', ''),
	});

	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, html);
	console.log(`[prerender-static] ${routePath} → ${outPath.replace(root + '/', '')}`);
}

async function prerenderToFile(
	routePath: string,
	outFile: string,
	expectedStatus: number,
): Promise<void> {
	const response = await handler(new Request(`${ORIGIN}${routePath}`));
	let html = await response.text();

	if (response.status !== expectedStatus) {
		throw new Error(
			`[prerender-static] ${routePath} returned ${response.status}, expected ${expectedStatus}`,
		);
	}

	const outPath = join(clientDir, outFile);
	html = dedupeStylesheetLinks(html);
	html = stripModulepreloadLinks(html);
	html = await inlineStylesheets(html, clientDir, {
		cssCache,
		logLabel: outPath.replace(root + '/', ''),
	});

	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, html);
	console.log(`[prerender-static] ${routePath} → ${outPath.replace(root + '/', '')}`);
}

for (const routePath of PRERENDER_ROUTES) {
	await prerenderRoute(routePath);
}

await prerenderToFile('/__ssg-404-preview__', '404.html', 404);

console.log(`[prerender-static] wrote ${PRERENDER_ROUTES.length + 1} HTML files`);
