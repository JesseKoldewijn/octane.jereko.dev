#!/usr/bin/env node
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const site = 'https://jereko.dev';

const routes = [
	'/',
	'/projects',
	'/experience',
	'/about-me',
	'/about-me/hobbies',
	'/about-me/volunteering',
];

const urls = routes
	.map(
		(path) => `  <url>
    <loc>${site}${path === '/' ? '' : path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
	)
	.join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await mkdir(join(root, 'public'), { recursive: true });
await writeFile(join(root, 'public/sitemap.xml'), sitemap);
console.log('[generate-sitemap] wrote public/sitemap.xml');
