#!/usr/bin/env node
/**
 * Local production server for preview and e2e tests.
 * Vercel adapter exports adapt() only — no serve() — so entry.js cannot boot directly.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

const root = fileURLToPath(new URL('..', import.meta.url));
const staticDir = join(root, 'dist/client');
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';

const { handler } = await import(join(root, 'dist/server/entry.js'));

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
 * @param {import('node:http').IncomingMessage} nodeRequest
 */
function toWebRequest(nodeRequest) {
	const url = new URL(nodeRequest.url ?? '/', `http://${nodeRequest.headers.host ?? 'localhost'}`);
	const headers = new Headers();
	for (const [key, value] of Object.entries(nodeRequest.headers)) {
		if (value == null) continue;
		if (Array.isArray(value)) {
			for (const part of value) headers.append(key, part);
		} else {
			headers.set(key, value);
		}
	}
	const method = (nodeRequest.method ?? 'GET').toUpperCase();
	/** @type {RequestInit & { duplex?: 'half' }} */
	const init = { method, headers };
	if (method !== 'GET' && method !== 'HEAD') {
		init.body = Readable.toWeb(nodeRequest);
		init.duplex = 'half';
	}
	return new Request(url, init);
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {Response} webResponse
 */
async function sendWebResponse(res, webResponse) {
	res.statusCode = webResponse.status;
	if (webResponse.statusText) res.statusMessage = webResponse.statusText;
	webResponse.headers.forEach((value, key) => res.setHeader(key, value));
	if (webResponse.body) {
		const reader = webResponse.body.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				res.write(value);
			}
		} finally {
			reader.releaseLock();
		}
	}
	res.end();
}

/**
 * @param {string} pathname
 */
function tryServeStatic(pathname) {
	const filePath = join(staticDir, pathname);
	if (!filePath.startsWith(staticDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
		return null;
	}
	const ext = extname(filePath).toLowerCase();
	return {
		stream: createReadStream(filePath),
		type: MIME[ext] ?? 'application/octet-stream',
	};
}

const server = createServer((req, res) => {
	(async () => {
		const pathname = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname;
		const asset = tryServeStatic(pathname);
		if (asset) {
			res.statusCode = 200;
			res.setHeader('Content-Type', asset.type);
			asset.stream.pipe(res);
			return;
		}

		const response = await handler(toWebRequest(req));
		await sendWebResponse(res, response);
	})().catch((error) => {
		console.error('[production-server] Request failed:', error);
		if (!res.headersSent) {
			res.statusCode = 500;
			res.end('Internal Server Error');
		}
	});
});

server.listen(port, host, () => {
	console.log(`[production-server] Listening on http://${host}:${port}`);
});
