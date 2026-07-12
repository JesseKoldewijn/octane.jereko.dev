#!/usr/bin/env node
/**
 * Emit .vercel/output after the full Vite build (including PWA) completes.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOctaneConfig } from '@octanejs/vite-plugin';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = await loadOctaneConfig(root);
const outDir = config.build.outDir;
const clientDir = path.join(root, outDir, 'client');
const serverDir = path.join(root, outDir, 'server');

if (!existsSync(path.join(serverDir, 'entry.js'))) {
	console.log('[adapt-vercel] No server entry — skipping Vercel output generation.');
	process.exit(0);
}

if (!config.adapter?.adapt) {
	console.log('[adapt-vercel] No adapter.adapt() — skipping.');
	process.exit(0);
}

await config.adapter.adapt({
	root,
	clientDir,
	serverDir,
	log: (msg) => console.log(msg),
});
