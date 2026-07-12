#!/usr/bin/env node
/**
 * Tailwind v4 + @tailwindcss/vite does not pick up .tsrx via glob @source.
 * Inject per-file @source entries into globals.css (must live in the tailwind entry file).
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const stylesDir = path.join(srcDir, 'styles');
const globalsFile = path.join(stylesDir, 'globals.css');

const START = '/* tailwind-sources:start */';
const END = '/* tailwind-sources:end */';

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walk(full)));
		} else if (/\.(tsrx|tsx|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
			files.push(full);
		}
	}
	return files;
}

const files = (await walk(srcDir)).sort();
const sourceBlock = [
	START,
	...files.map((file) => {
		const rel = path.relative(stylesDir, file).split(path.sep).join('/');
		return `@source "${rel}";`;
	}),
	END,
].join('\n');

let globals = await readFile(globalsFile, 'utf8');
const startIdx = globals.indexOf(START);
const endIdx = globals.indexOf(END);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
	console.error('[generate-tailwind-sources] Missing tailwind-sources markers in globals.css');
	process.exit(1);
}

globals = globals.slice(0, startIdx) + sourceBlock + globals.slice(endIdx + END.length);

await writeFile(globalsFile, globals);
console.log(
	`[generate-tailwind-sources] injected ${files.length} @source entries into globals.css`,
);
