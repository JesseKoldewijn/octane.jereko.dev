#!/usr/bin/env bun
/**
 * Emit static-only .vercel/output after prerender completes (no serverless function).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(root, 'dist/client');
const outputDir = join(root, '.vercel/output');
const staticDir = join(outputDir, 'static');

if (!existsSync(join(clientDir, 'index.html'))) {
	console.log('[adapt-vercel] No prerendered index.html — skipping Vercel output generation.');
	process.exit(0);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(staticDir, { recursive: true });
cpSync(clientDir, staticDir, { recursive: true });

const config = {
	version: 3 as const,
	cleanUrls: true,
	routes: [
		{
			src: '/sw\\.js',
			headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
			continue: true,
		},
		{
			src: '/workbox-.*\\.js',
			headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
			continue: true,
		},
		{
			src: '/assets/.+',
			headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
			continue: true,
		},
		{ handle: 'filesystem' },
		{ src: '/(.*)', status: 404, dest: '/404.html' },
	],
};

writeFileSync(join(outputDir, 'config.json'), JSON.stringify(config, null, '\t') + '\n');

console.log(
	'[adapt-vercel] Static Build Output written to .vercel/output (no serverless function)',
);
