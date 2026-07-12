#!/usr/bin/env node
/**
 * Downloads remote images referenced by app data so static hosting serves them locally.
 * Includes hero/footer webp assets and YouTube thumbnails.
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const eventsPath = join(root, 'src/data/events.ts');
const imagesDir = join(root, 'public/images');
const techIconsDir = join(imagesDir, 'technologies');
const outDir = join(imagesDir, 'external/youtube');

const YOUTUBE_THUMB = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

/** Static assets mirrored from production jereko.dev */
const STATIC_IMAGES = [
	{
		url: 'https://jereko.dev/_astro/avatar.OXXrS8GF_ZFd2Sr.webp',
		dest: join(imagesDir, 'avatar.webp'),
	},
	{
		url: 'https://jereko.dev/_astro/banner-programming.Bnkxelmx_Z1XfDU6.webp',
		dest: join(imagesDir, 'banner-programming.webp'),
	},
	{
		url: 'https://jereko.dev/_astro/profile.Cby-IqTy.webp',
		dest: join(imagesDir, 'profile.webp'),
	},
];

function collectYoutubeIdsFromEventsSource(source) {
	const ids = new Set();
	const watchRe = /watch\?v=([A-Za-z0-9_-]{6,})/g;
	let m;
	while ((m = watchRe.exec(source)) !== null) ids.add(m[1]);
	const shortRe = /youtu\.be\/([A-Za-z0-9_-]{6,})/g;
	while ((m = shortRe.exec(source)) !== null) ids.add(m[1]);
	return [...ids];
}

async function fetchBinary(url) {
	const res = await fetch(url, {
		headers: {
			'user-agent': 'Mozilla/5.0 (compatible; JerekoStaticAssetFetcher/1.0; +https://jereko.dev)',
			accept: 'image/*,*/*;q=0.8',
		},
		redirect: 'follow',
	});
	if (!res.ok) {
		throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
	}
	const buf = Buffer.from(await res.arrayBuffer());
	if (buf.length < 500) {
		throw new Error(`GET ${url} -> suspiciously small body (${buf.length} bytes)`);
	}
	return buf;
}

async function fetchThumbnail(id) {
	return fetchBinary(YOUTUBE_THUMB(id));
}

async function syncTechIconsFromPlatformicons() {
	const vercelSource = join(root, 'node_modules/platformicons/svg_80x80/vercel.svg');
	const vercelDest = join(techIconsDir, 'vercel.svg');

	await mkdir(techIconsDir, { recursive: true });

	process.stdout.write('[fetch-external-images] vercel.svg (platformicons) … ');
	try {
		await copyFile(vercelSource, vercelDest);
		console.log('OK');
	} catch (e) {
		console.log('FAILED');
		console.error(e);
		process.exitCode = 1;
	}
}

async function fetchStaticImages() {
	await mkdir(imagesDir, { recursive: true });

	for (const { url, dest } of STATIC_IMAGES) {
		const name = dest.split('/').pop();
		process.stdout.write(`[fetch-external-images] ${name} … `);
		try {
			const body = await fetchBinary(url);
			await writeFile(dest, body);
			console.log(`${(body.length / 1024).toFixed(1)} KiB`);
		} catch (e) {
			console.log('FAILED');
			console.error(e);
			process.exitCode = 1;
		}
	}
}

async function fetchYoutubeThumbnails() {
	const source = await readFile(eventsPath, 'utf8');
	const ids = collectYoutubeIdsFromEventsSource(source);
	if (ids.length === 0) {
		console.warn('[fetch-external-images] No YouTube URLs found in src/data/events.ts');
		return null;
	}

	await mkdir(outDir, { recursive: true });

	for (const id of ids) {
		const dest = join(outDir, `${id}.jpg`);
		process.stdout.write(`[fetch-external-images] ${id}.jpg … `);
		try {
			const body = await fetchThumbnail(id);
			await writeFile(dest, body);
			console.log(`${(body.length / 1024).toFixed(1)} KiB`);
		} catch (e) {
			console.log('FAILED');
			console.error(e);
			process.exitCode = 1;
		}
	}

	return ids[0] ?? null;
}

async function main() {
	await syncTechIconsFromPlatformicons();
	await fetchStaticImages();
	const firstYoutubeId = await fetchYoutubeThumbnails();

	if (firstYoutubeId) {
		const placeholderDest = join(imagesDir, 'player-placeholder.webp');
		const youtubeThumb = join(outDir, `${firstYoutubeId}.jpg`);
		process.stdout.write('[fetch-external-images] player-placeholder.webp … ');
		try {
			await copyFile(youtubeThumb, placeholderDest);
			console.log('(from YouTube thumbnail)');
		} catch (e) {
			console.log('FAILED');
			console.error(e);
			process.exitCode = 1;
		}
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
