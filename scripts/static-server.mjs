#!/usr/bin/env node
/**
 * Serve prerendered static output for preview and e2e tests.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { htmlOutputPath } from './lib/static-paths.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const staticDir = join(root, 'dist/client');
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';

const MIME = {
	'.css': 'text/css',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.map': 'application/json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml',
	'.webmanifest': 'application/manifest+json',
};

/**
 * @param {string} pathname
 */
function resolveStaticFile(pathname) {
	if (pathname !== '/' && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}

	const directPath = join(staticDir, pathname);
	if (directPath.startsWith(staticDir) && existsSync(directPath) && statSync(directPath).isFile()) {
		return directPath;
	}

	const cleanUrlPath = htmlOutputPath(staticDir, pathname === '' ? '/' : pathname);
	if (existsSync(cleanUrlPath) && statSync(cleanUrlPath).isFile()) {
		return cleanUrlPath;
	}

	return null;
}

const server = createServer((req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
	let pathname = decodeURIComponent(url.pathname);

	const filePath = resolveStaticFile(pathname);
	if (filePath) {
		const ext = extname(filePath).toLowerCase();
		res.statusCode = 200;
		res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
		createReadStream(filePath).pipe(res);
		return;
	}

	const notFoundPath = join(staticDir, '404.html');
	if (existsSync(notFoundPath)) {
		res.statusCode = 404;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		createReadStream(notFoundPath).pipe(res);
		return;
	}

	res.statusCode = 404;
	res.end('Not Found');
});

server.listen(port, host, () => {
	console.log(`[static-server] Serving ${staticDir} at http://${host}:${port}`);
});
