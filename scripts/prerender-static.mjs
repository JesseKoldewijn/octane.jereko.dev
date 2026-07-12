#!/usr/bin/env node
/**
 * Prerender all routes to static HTML using the production server handler.
 * Runs after vite build; dist/server/entry.js is build-time only.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PRERENDER_ROUTES } from '../src/config/routes.ts';
import { htmlOutputPath } from './lib/static-paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(root, 'dist/client');
const serverEntry = join(root, 'dist/server/entry.js');
const ORIGIN = 'http://127.0.0.1';

/** Remove duplicate stylesheet links (Vite index.html + ssr-head injection). */
function dedupeStylesheetLinks(html) {
	const seen = new Set();
	return html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (tag) => {
		const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
		if (!hrefMatch) return tag;
		const href = hrefMatch[1];
		if (seen.has(href)) return '';
		seen.add(href);
		return tag;
	});
}

const { handler } = await import(serverEntry);

/**
 * @param {string} routePath
 */
async function prerenderRoute(routePath) {
	const response = await handler(new Request(`${ORIGIN}${routePath}`));
	let html = await response.text();
	html = dedupeStylesheetLinks(html);

	if (response.status !== 200) {
		throw new Error(
			`[prerender-static] ${routePath} returned ${response.status}:\n${html.slice(0, 500)}`,
		);
	}

	const outPath = htmlOutputPath(clientDir, routePath);
	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, html);
	console.log(`[prerender-static] ${routePath} → ${outPath.replace(root + '/', '')}`);
}

/** @param {string} routePath
 * @param {number} expectedStatus
 */
async function prerenderToFile(routePath, outFile, expectedStatus) {
	const response = await handler(new Request(`${ORIGIN}${routePath}`));
	let html = await response.text();
	html = dedupeStylesheetLinks(html);

	if (response.status !== expectedStatus) {
		throw new Error(
			`[prerender-static] ${routePath} returned ${response.status}, expected ${expectedStatus}`,
		);
	}

	const outPath = join(clientDir, outFile);
	await mkdir(dirname(outPath), { recursive: true });
	await writeFile(outPath, html);
	console.log(`[prerender-static] ${routePath} → ${outPath.replace(root + '/', '')}`);
}

for (const routePath of PRERENDER_ROUTES) {
	await prerenderRoute(routePath);
}

await prerenderToFile('/__ssg-404-preview__', '404.html', 404);

console.log(`[prerender-static] wrote ${PRERENDER_ROUTES.length + 1} HTML files`);
