import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientAssetsDir = path.join(root, 'dist/client/assets');
const serverHtmlPath = path.join(root, 'dist/server/index.html');

if (!fs.existsSync(clientAssetsDir) || !fs.existsSync(serverHtmlPath)) {
	process.exit(0);
}

const cssFile = fs
	.readdirSync(clientAssetsDir)
	.filter((name) => name.endsWith('.css'))
	.sort()
	.find((name) => name.startsWith('App-') || name.startsWith('index-'));

if (!cssFile) {
	process.exit(0);
}

const href = `/assets/${cssFile}`;
let html = fs.readFileSync(serverHtmlPath, 'utf-8');

const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const existingLink =
	html.match(new RegExp(`<link rel="stylesheet"[^>]*href="${escapedHref}"[^>]*>`, 'i'))?.[0] ??
	html.match(new RegExp(`<link[^>]*href="${escapedHref}"[^>]*rel="stylesheet"[^>]*>`, 'i'))?.[0];

const linkTag =
	existingLink?.replace(/\s*\/?>/, ' />') ?? `<link rel="stylesheet" crossorigin href="${href}" />`;

const headMarker = `${linkTag}\n    <!--ssr-head-->`;
if (html.includes(headMarker)) {
	process.exit(0);
}

if (existingLink) {
	html = html.replace(existingLink, '');
}

if (!html.includes('<!--ssr-head-->')) {
	process.exit(0);
}

html = html.replace('<!--ssr-head-->', headMarker);
fs.writeFileSync(serverHtmlPath, html);
