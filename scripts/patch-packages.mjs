#!/usr/bin/env node
/**
 * Patches broken/missing files in published octane@0.1.3 and @octanejs/vite-plugin@0.1.3.
 * Idempotent — safe to run on postinstall and before every build.
 * Remove once upstream npm packages are fixed.
 */
import { writeFile, mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const patchesDir = path.join(root, 'patches');

const PATCH_MARKER = '/* octane.jereko.dev/postinstall-patch */';

/** @param {string} block */
function parseNamedList(block) {
	const seen = new Set();
	const names = [];
	for (const part of block.split(',')) {
		const name = part.trim();
		if (name && !seen.has(name)) {
			seen.add(name);
			names.push(name);
		}
	}
	return names;
}

/** @param {string} source @param {string} fromModule @param {string[]} names */
function mergeImportNames(source, fromModule, names) {
	const escaped = fromModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const importRe = new RegExp(`import \\{([\\s\\S]*?)\\} from "${escaped}";`, 'm');
	const match = source.match(importRe);
	if (!match) return source;

	const merged = [...parseNamedList(match[1])];
	for (const name of names) {
		if (!merged.includes(name)) merged.push(name);
	}

	return source.replace(importRe, `import {\n  ${merged.join(',\n  ')}\n} from "${fromModule}";`);
}

/** @param {string} source @param {string[]} names */
function mergeExportNames(source, names) {
	const exportRe = /export \{([\s\S]*?)\};/m;
	const match = source.match(exportRe);
	if (!match) return source;

	const merged = [...parseNamedList(match[1])];
	for (const name of names) {
		if (!merged.includes(name)) merged.push(name);
	}

	return source.replace(exportRe, `export {\n  ${merged.join(',\n  ')}\n};`);
}

/** @param {string} source @param {string} insertBefore @param {string} snippet */
function insertOnceBefore(source, insertBefore, snippet) {
	if (source.includes(snippet.trim().split('\n')[0])) return source;
	return source.replace(insertBefore, `${snippet}\n${insertBefore}`);
}

// --- octane@0.1.3 missing dist files ---
const dist = path.join(root, 'node_modules/octane/dist');

const rpcJs = `import * as devalue from 'devalue';

export async function executeServerFunction(fn, body) {
  const args = devalue.parse(body);
  const value = await fn.apply(null, args);
  return devalue.stringify({ value });
}
`;

const cssJs = `export function normalizeClass(value) {
  if (value == null || value === false) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    return Object.entries(value).filter(([, v]) => v).map(([k]) => k).join(' ');
  }
  return '';
}

export function styleName(name) {
  if (name.startsWith('--')) return name;
  return name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
`;

const staticIndexJs = `export { prerender } from '../runtime.server.js';
`;

await mkdir(path.join(dist, 'server'), { recursive: true });
await mkdir(path.join(dist, 'static'), { recursive: true });
await writeFile(path.join(dist, 'server', 'rpc.js'), rpcJs);
await writeFile(path.join(dist, 'css.js'), cssJs);
await writeFile(path.join(dist, 'static', 'index.js'), staticIndexJs);

const runtimeServerPath = path.join(dist, 'runtime.server.js');
let runtimeServer = await readFile(runtimeServerPath, 'utf8');

if (!runtimeServer.includes(PATCH_MARKER)) {
	if (!runtimeServer.includes('function isChildrenBlock')) {
		const childrenBlockFns = `
const CHILDREN_BLOCK = Symbol.for('octane.childrenBlock');
function markChildrenBlock(fn) {
  if (typeof fn === 'function') fn[CHILDREN_BLOCK] = true;
  return fn;
}
function isChildrenBlock(value) {
  return typeof value === 'function' && value[CHILDREN_BLOCK] === true;
}
`;
		runtimeServer = insertOnceBefore(runtimeServer, 'export {', childrenBlockFns);
	}

	if (!runtimeServer.includes('function flushSync')) {
		const flushSyncFn = `function flushSync(fn) {
  return fn();
}
`;
		runtimeServer = insertOnceBefore(runtimeServer, 'export {', flushSyncFn);
	}

	const runtimeExtrasPath = path.join(patchesDir, 'octane/runtime-server-extras.js');
	const runtimeExtras = await readFile(runtimeExtrasPath, 'utf8');
	if (!runtimeServer.includes('function isValidElement')) {
		runtimeServer = insertOnceBefore(runtimeServer, 'export {', runtimeExtras);
	}

	runtimeServer = mergeExportNames(runtimeServer, [
		'isChildrenBlock',
		'markChildrenBlock',
		'flushSync',
		'isValidElement',
		'cloneElement',
		'Children',
		'positionalChildren',
		'createPortal',
	]);

	runtimeServer = `${PATCH_MARKER}\n${runtimeServer}`;
	await writeFile(runtimeServerPath, runtimeServer);
}

const patchedServerSymbols = [
	'flushSync',
	'isChildrenBlock',
	'markChildrenBlock',
	'isValidElement',
	'cloneElement',
	'Children',
	'createPortal',
	'positionalChildren',
];

const serverIndexPath = path.join(dist, 'server/index.js');
let serverIndex = await readFile(serverIndexPath, 'utf8');

serverIndex = serverIndex.replace(PATCH_MARKER, '').trimStart();
serverIndex = mergeImportNames(serverIndex, '../runtime.server.js', patchedServerSymbols);
serverIndex = mergeExportNames(serverIndex, patchedServerSymbols);
serverIndex = `${PATCH_MARKER}\n${serverIndex}`;
await writeFile(serverIndexPath, serverIndex);

const runtimeClientPath = path.join(dist, 'runtime.js');
let runtimeClient = await readFile(runtimeClientPath, 'utf8');

if (!runtimeClient.includes('function isChildrenBlock')) {
	const childrenBlockFns = `
const CHILDREN_BLOCK = Symbol.for('octane.childrenBlock');
function markChildrenBlock(fn) {
  if (typeof fn === 'function') fn[CHILDREN_BLOCK] = true;
  return fn;
}
function isChildrenBlock(value) {
  return typeof value === 'function' && value[CHILDREN_BLOCK] === true;
}
`;
	runtimeClient = insertOnceBefore(runtimeClient, 'export {', childrenBlockFns);
	runtimeClient = mergeExportNames(runtimeClient, ['isChildrenBlock', 'markChildrenBlock']);
	await writeFile(runtimeClientPath, runtimeClient);
}

const clientIndexPath = path.join(dist, 'index.js');
let clientIndex = await readFile(clientIndexPath, 'utf8');
clientIndex = mergeExportNames(clientIndex, ['isChildrenBlock', 'markChildrenBlock']);
if (clientIndex !== (await readFile(clientIndexPath, 'utf8'))) {
	await writeFile(clientIndexPath, clientIndex);
}

// --- @octanejs/vite-plugin@0.1.3 — local overrides ---
const vitePluginDir = path.join(root, 'node_modules/@octanejs/vite-plugin/src');

const vitePluginPatches = [
	['vite-plugin/render-route.js', 'server/render-route.js'],
	['vite-plugin/project-codegen.js', 'project-codegen.js'],
	['vite-plugin/load-config.js', 'load-config.js'],
	['vite-plugin/node-runtime.js', 'node-runtime.js'],
];

for (const [src, dest] of vitePluginPatches) {
	await copyFile(path.join(patchesDir, src), path.join(vitePluginDir, dest));
}

const routesPath = path.join(vitePluginDir, 'routes.js');
let routesJs = await readFile(routesPath, 'utf8');
if (!routesJs.includes('this.status = options.status')) {
	routesJs = routesJs.replace(
		'this.before = options.before ?? [];\n\t}',
		'this.before = options.before ?? [];\n\t\tthis.status = options.status;\n\t}',
	);
	await writeFile(routesPath, routesJs);
}

const viteIndexPath = path.join(vitePluginDir, 'index.js');
let viteIndex = await readFile(viteIndexPath, 'utf8');

if (!viteIndex.includes('should_skip_octane_routing')) {
	const skipFn = `
/**
 * Dev-only: let Vite serve modules, HMR, and public assets.
 * Catch-all octane routes (e.g. \`/*splat\`) otherwise swallow them.
 */
function should_skip_octane_routing(pathname) {
	if (pathname.startsWith('/@') || pathname.startsWith('/__vite') || pathname.startsWith('/@fs/')) {
		return true;
	}
	if (pathname.startsWith('/node_modules/')) return true;
	const dot = pathname.lastIndexOf('.');
	if (dot === -1) return false;
	const ext = pathname.slice(dot + 1).split(/[?#]/)[0].toLowerCase();
	return (
		ext === 'css' ||
		ext === 'js' ||
		ext === 'mjs' ||
		ext === 'ts' ||
		ext === 'tsx' ||
		ext === 'tsrx' ||
		ext === 'jsx' ||
		ext === 'json' ||
		ext === 'map' ||
		ext === 'wasm' ||
		ext === 'ico' ||
		ext === 'png' ||
		ext === 'jpg' ||
		ext === 'jpeg' ||
		ext === 'gif' ||
		ext === 'webp' ||
		ext === 'avif' ||
		ext === 'svg' ||
		ext === 'woff' ||
		ext === 'woff2' ||
		ext === 'ttf' ||
		ext === 'eot'
	);
}
`;
	viteIndex = viteIndex.replace(
		"const OCTANE_EXTENSIONS = ['.tsrx'];",
		`const OCTANE_EXTENSIONS = ['.tsrx'];${skipFn}`,
	);
	viteIndex = viteIndex.replace(
		`					const match = router.match(method, url.pathname);
					if (!match) {
						next();
						return;
					}`,
		`					if (should_skip_octane_routing(url.pathname)) {
						next();
						return;
					}

					const match = router.match(method, url.pathname);
					if (!match) {
						next();
						return;
					}`,
	);
	await writeFile(viteIndexPath, viteIndex);
} else if (!viteIndex.includes("ext === 'tsrx'")) {
	viteIndex = viteIndex.replace(
		"ext === 'tsx' ||",
		"ext === 'tsx' ||\n\t\text === 'tsrx' ||\n\t\text === 'jsx' ||",
	);
	await writeFile(viteIndexPath, viteIndex);
}

const vitePluginPkgPath = path.join(root, 'node_modules/@octanejs/vite-plugin/package.json');
const vitePluginPkg = JSON.parse(await readFile(vitePluginPkgPath, 'utf8'));
vitePluginPkg.exports['./node'] = {
	types: './types/node.d.ts',
	import: './src/server/node-http.js',
	default: './src/server/node-http.js',
};
await writeFile(vitePluginPkgPath, JSON.stringify(vitePluginPkg, null, 2) + '\n');

const tanstackRouterDir = path.join(root, 'node_modules/@octanejs/tanstack-router/src');
await copyFile(
	path.join(patchesDir, 'tanstack-router/Link.tsrx'),
	path.join(tanstackRouterDir, 'Link.tsrx'),
);

console.log('[patch-packages] patched octane dist + @octanejs/vite-plugin');

await import('./patch-vite-plugin-phase2.mjs');
