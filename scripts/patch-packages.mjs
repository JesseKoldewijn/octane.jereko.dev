#!/usr/bin/env node
/**
 * Patches broken/missing files in published octane@0.1.3 and @octanejs/vite-plugin@0.1.3.
 * Idempotent — safe to run on postinstall and before every build.
 * Remove once upstream npm packages are fixed.
 */
import { writeFile, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const patchesDir = path.join(root, 'patches');

const PATCH_MARKER = '/* octane.jereko.dev/postinstall-patch */';
const PHASE2_MARKER = '/* octane.jereko.dev/phase2-patch */';

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

// --- octane@0.1.3 runtime patches (missing exports in published package) ---
const dist = path.join(root, 'node_modules/octane/dist');

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

const clientPatchedSymbols = ['isChildrenBlock', 'markChildrenBlock'];

const clientIndexPath = path.join(dist, 'index.js');
let clientIndex = await readFile(clientIndexPath, 'utf8');
clientIndex = mergeImportNames(clientIndex, './runtime.js', clientPatchedSymbols);
clientIndex = mergeExportNames(clientIndex, clientPatchedSymbols);
await writeFile(clientIndexPath, clientIndex);

if (
	!clientIndex.includes('isChildrenBlock') ||
	!/import\s*\{[\s\S]*isChildrenBlock[\s\S]*\}\s*from\s*"\.\/runtime\.js"/.test(clientIndex)
) {
	throw new Error(
		'[patch-packages] Failed to patch octane/dist/index.js — isChildrenBlock import missing.',
	);
}

// --- @octanejs/vite-plugin@0.1.3 — local overrides + Phase 2 production build ---
const vitePluginDir = path.join(root, 'node_modules/@octanejs/vite-plugin/src');

const vitePluginPatches = [
	['vite-plugin/render-route.js', 'server/render-route.js'],
	['vite-plugin/project-codegen.js', 'project-codegen.js'],
	['vite-plugin/load-config.js', 'load-config.js'],
	['vite-plugin/node-runtime.js', 'node-runtime.js'],
	['vite-plugin/production.js', 'server/production.js'],
	['vite-plugin/virtual-entry.js', 'server/virtual-entry.js'],
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

// Phase 2 production build hooks (upstream 0.1.3 stubs this).
viteIndex = await readFile(viteIndexPath, 'utf8');

if (!viteIndex.includes(PHASE2_MARKER)) {
	if (!viteIndex.includes("import path from 'node:path'")) {
		viteIndex = viteIndex.replace(
			"import fs from 'node:fs';",
			"import fs from 'node:fs';\nimport path from 'node:path';",
		);
	}

	if (!viteIndex.includes('generateServerEntry')) {
		viteIndex = viteIndex.replace(
			"import { createRouter } from './server/router.js';",
			"import { generateServerEntry } from './server/virtual-entry.js';\nimport { ENTRY_FILENAME } from './constants.js';\nimport { get_route_entry_path } from './routes.js';\nimport { createRouter } from './server/router.js';",
		);
	}

	if (!viteIndex.includes('let isBuild = false')) {
		viteIndex = viteIndex.replace(
			'/** @type {ReturnType<typeof createRouter> | null} */\n\tlet router = null;',
			`/** @type {ReturnType<typeof createRouter> | null} */\n\tlet router = null;\n\n\t/** @type {boolean} */\n\tlet isBuild = false;\n\t/** @type {boolean} */\n\tlet isSSRBuild = false;\n\t/** @type {string[]} */\n\tlet renderRouteEntries = [];\n\t/** @type {ResolvedOctaneConfig | null} */\n\tlet loadedOctaneConfig = null;`,
		);
	}

	const oldConfigHook = `\t\tconfig(userConfig) {
\t\t\tconst exclude = userConfig.optimizeDeps?.exclude || [];
\t\t\treturn {
\t\t\t\t// SSR owns routing; do not let Vite SPA-fallback to index.html.
\t\t\t\tappType: 'custom',
\t\t\t\toptimizeDeps: {
\t\t\t\t\texclude: [
\t\t\t\t\t\t// \`@octanejs/query\` ships a \`.tsrx\` provider component, so it must NOT
\t\t\t\t\t\t// be esbuild-prebundled — the octane transform owns \`.tsrx\` compilation.
\t\t\t\t\t\t...new Set([
\t\t\t\t\t\t\t...exclude,
\t\t\t\t\t\t\t'octane',
\t\t\t\t\t\t\t'octane/compiler',
\t\t\t\t\t\t\t'@octanejs/query',
\t\t\t\t\t\t\t...SERVER_ONLY_ADAPTER_IDS,
\t\t\t\t\t\t]),
\t\t\t\t\t],
\t\t\t\t},
\t\t\t\t// Workspace packages with TS source must be transformed by Vite's SSR
\t\t\t\t// pipeline (not require()'d raw) so ssrLoadModule gets transpiled code.
\t\t\t\tssr: {
\t\t\t\t\tnoExternal: ['octane', 'octane/compiler', '@octanejs/query'],
\t\t\t\t},
\t\t\t};
\t\t},`;

	const newConfigHook = `\t\tasync config(userConfig, { command }) {
\t\t\tisBuild = command === 'build';
\t\t\tisSSRBuild = !!userConfig.build?.ssr;

\t\t\tconst exclude = userConfig.optimizeDeps?.exclude || [];
\t\t\t/** @type {import('vite').UserConfig} */
\t\t\tconst baseConfig = {
\t\t\t\tappType: 'custom',
\t\t\t\toptimizeDeps: {
\t\t\t\t\texclude: [
\t\t\t\t\t\t...new Set([
\t\t\t\t\t\t\t...exclude,
\t\t\t\t\t\t\t'octane',
\t\t\t\t\t\t\t'octane/compiler',
\t\t\t\t\t\t\t'@octanejs/query',
\t\t\t\t\t\t\t...SERVER_ONLY_ADAPTER_IDS,
\t\t\t\t\t\t]),
\t\t\t\t\t],
\t\t\t\t},
\t\t\t\tssr: {
\t\t\t\t\tnoExternal: ['octane', 'octane/compiler', '@octanejs/query'],
\t\t\t\t},
\t\t\t};

\t\t\tif (isBuild && !isSSRBuild) {
\t\t\t\tconst projectRoot = userConfig.root || process.cwd();
\t\t\t\tif (octaneConfigExists(projectRoot)) {
\t\t\t\t\tloadedOctaneConfig = await loadOctaneConfig(projectRoot);
\t\t\t\t\tif (has_route_config(loadedOctaneConfig)) {
\t\t\t\t\t\tconst htmlInput = path.join(projectRoot, 'index.html');
\t\t\t\t\t\tif (!fs.existsSync(htmlInput)) {
\t\t\t\t\t\t\tthrow new Error(
\t\t\t\t\t\t\t\t'[@octanejs/vite-plugin] index.html not found. Required for SSR builds.',
\t\t\t\t\t\t\t);
\t\t\t\t\t\t}

\t\t\t\t\t\tconsole.log(
\t\t\t\t\t\t\t'[@octanejs/vite-plugin] Detected octane.config.ts — configuring client build',
\t\t\t\t\t\t);

\t\t\t\t\t\tconst outDir = loadedOctaneConfig.build.outDir;
\t\t\t\t\t\t/** @type {Record<string, string>} */
\t\t\t\t\t\tconst rollupInput = { main: htmlInput };

\t\t\t\t\t\tconst renderRoutes = loadedOctaneConfig.router.routes.filter(
\t\t\t\t\t\t\t(/** @type {import('./routes.js').RenderRoute} */ r) => r.type === 'render',
\t\t\t\t\t\t);
\t\t\t\t\t\tconst uniqueEntries = [
\t\t\t\t\t\t\t...new Set(
\t\t\t\t\t\t\t\trenderRoutes
\t\t\t\t\t\t\t\t\t.map((r) => r.entry)
\t\t\t\t\t\t\t\t\t.map(get_route_entry_path)
\t\t\t\t\t\t\t\t\t.filter((entry) => typeof entry === 'string'),
\t\t\t\t\t\t\t),
\t\t\t\t\t\t];
\t\t\t\t\t\tfor (const entry of uniqueEntries) {
\t\t\t\t\t\t\tconst sourcePath = entry.startsWith('/') ? entry.slice(1) : entry;
\t\t\t\t\t\t\trollupInput[sourcePath] = path.join(projectRoot, sourcePath);
\t\t\t\t\t\t}

\t\t\t\t\t\t/** @type {import('vite').UserConfig['build']} */
\t\t\t\t\t\tconst buildConfig = {
\t\t\t\t\t\t\toutDir: \`\${outDir}/client\`,
\t\t\t\t\t\t\temptyOutDir: true,
\t\t\t\t\t\t\tmanifest: true,
\t\t\t\t\t\t\trollupOptions: { input: rollupInput },
\t\t\t\t\t\t};
\t\t\t\t\t\tif (loadedOctaneConfig.build.minify !== undefined) {
\t\t\t\t\t\t\tbuildConfig.minify = loadedOctaneConfig.build.minify;
\t\t\t\t\t\t}
\t\t\t\t\t\tif (loadedOctaneConfig.build.target !== undefined) {
\t\t\t\t\t\t\tbuildConfig.target = loadedOctaneConfig.build.target;
\t\t\t\t\t\t}

\t\t\t\t\t\treturn { ...baseConfig, build: buildConfig };
\t\t\t\t\t}
\t\t\t\t}
\t\t\t}

\t\t\treturn baseConfig;
\t\t},`;

	if (!viteIndex.includes(oldConfigHook)) {
		throw new Error('[patch-packages] Could not find config hook to replace for Phase 2');
	}
	viteIndex = viteIndex.replace(oldConfigHook, newConfigHook);

	viteIndex = viteIndex.replace(
		`create_client_entry_source({
\t\t\t\t\t\tconfigPath: to_vite_root_import(getOctaneConfigPath(root), root),
\t\t\t\t\t\tstaticEntries: [],
\t\t\t\t\t}),`,
		`create_client_entry_source({
\t\t\t\t\t\tconfigPath: to_vite_root_import(getOctaneConfigPath(root), root),
\t\t\t\t\t\tstaticEntries: isBuild ? renderRouteEntries : [],
\t\t\t\t\t}),`,
	);

	const phase2Hooks = `
\t\tasync buildStart() {
\t\t\tif (!isBuild || isSSRBuild) return;
\t\t\tif (!loadedOctaneConfig) {
\t\t\t\tif (!octaneConfigExists(root)) return;
\t\t\t\tloadedOctaneConfig = await loadOctaneConfig(root);
\t\t\t}
\t\t\tif (!has_route_config(loadedOctaneConfig)) return;

\t\t\trenderRouteEntries = loadedOctaneConfig.router.routes
\t\t\t\t.filter((/** @type {RenderRoute} */ r) => r.type === 'render')
\t\t\t\t.flatMap((/** @type {RenderRoute} */ r) => [get_route_entry_path(r.entry), r.layout])
\t\t\t\t.filter((entry) => typeof entry === 'string');
\t\t\trenderRouteEntries = [...new Set(renderRouteEntries)];

\t\t\tif (loadedOctaneConfig.router.preHydrate) {
\t\t\t\trenderRouteEntries.push(loadedOctaneConfig.router.preHydrate);
\t\t\t}
\t\t},

\t\ttransformIndexHtml: {
\t\t\torder: 'pre',
\t\t\thandler(html) {
\t\t\t\tif (!isBuild || isSSRBuild || !has_route_config(loadedOctaneConfig)) return html;
\t\t\t\tconst hydrationScript = \`<script type="module" src="\${VIRTUAL_HYDRATE_ID}"></script>\`;
\t\t\t\treturn html.replace('</body>', \`\${hydrationScript}\\n</body>\`);
\t\t\t},
\t\t},

\t\tasync closeBundle() {
\t\t\tif (!isBuild || isSSRBuild) return;

\t\t\tif (!loadedOctaneConfig) {
\t\t\t\tif (!octaneConfigExists(root)) return;
\t\t\t\tloadedOctaneConfig = await loadOctaneConfig(root);
\t\t\t}
\t\t\tif (!has_route_config(loadedOctaneConfig)) return;

\t\t\tconsole.log('[@octanejs/vite-plugin] Client build done. Starting server build...');
\t\t\tloadedOctaneConfig = resolveOctaneConfig(loadedOctaneConfig, { requireAdapter: true });

\t\t\tconst outDir = loadedOctaneConfig.build.outDir;
\t\t\tconst clientOutDir = path.join(root, outDir, 'client');
\t\t\tconst manifestPath = path.join(clientOutDir, '.vite', 'manifest.json');

\t\t\t/** @type {Record<string, { file: string, css?: string[], imports?: string[], name?: string }>} */
\t\t\tlet clientManifest = {};
\t\t\tif (fs.existsSync(manifestPath)) {
\t\t\t\tclientManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
\t\t\t} else {
\t\t\t\tconsole.warn(
\t\t\t\t\t'[@octanejs/vite-plugin] Client manifest not found at',
\t\t\t\t\tmanifestPath,
\t\t\t\t);
\t\t\t\treturn;
\t\t\t}

\t\t\tconst collectCss = (key, visited = new Set()) => {
\t\t\t\tif (visited.has(key)) return [];
\t\t\t\tvisited.add(key);
\t\t\t\tconst entry = clientManifest[key];
\t\t\t\tif (!entry) return [];
\t\t\t\t/** @type {string[]} */
\t\t\t\tconst css = [...(entry.css || [])];
\t\t\t\tfor (const imp of entry.imports || []) {
\t\t\t\t\tcss.push(...collectCss(imp, visited));
\t\t\t\t}
\t\t\t\treturn css;
\t\t\t};

\t\t\t/** @type {Record<string, { js: string, css: string[] }>} */
\t\t\tconst clientAssetMap = {};
\t\t\tconst renderRoutes = loadedOctaneConfig.router.routes.filter(
\t\t\t\t(/** @type {import('./routes.js').RenderRoute} */ r) => r.type === 'render',
\t\t\t);
\t\t\tconst uniqueEntries = [
\t\t\t\t...new Set(
\t\t\t\t\trenderRoutes
\t\t\t\t\t\t.map((r) => r.entry)
\t\t\t\t\t\t.map(get_route_entry_path)
\t\t\t\t\t\t.filter((entry) => typeof entry === 'string'),
\t\t\t\t),
\t\t\t];

\t\t\tfor (const entry of uniqueEntries) {
\t\t\t\tconst manifestKey = entry.startsWith('/') ? entry.slice(1) : entry;
\t\t\t\tconst manifestEntry = clientManifest[manifestKey];
\t\t\t\tif (manifestEntry) {
\t\t\t\t\tclientAssetMap[entry] = {
\t\t\t\t\t\tjs: manifestEntry.file,
\t\t\t\t\t\tcss: [...new Set(collectCss(manifestKey))],
\t\t\t\t\t};
\t\t\t\t}
\t\t\t}

\t\t\tlet hydrateJsAsset = '';
\t\t\tfor (const [key, value] of Object.entries(clientManifest)) {
\t\t\t\tif (key.includes('virtual:octane-hydrate') || value.name === '__octane_hydrate') {
\t\t\t\t\thydrateJsAsset = value.file;
\t\t\t\t\tbreak;
\t\t\t\t}
\t\t\t}
\t\t\tif (hydrateJsAsset) {
\t\t\t\tclientAssetMap.__hydrate_js = { js: hydrateJsAsset, css: [] };
\t\t\t}

\t\t\ttry {
\t\t\t\tfs.rmSync(path.join(clientOutDir, '.vite'), { recursive: true, force: true });
\t\t\t} catch {
\t\t\t\t// non-fatal
\t\t\t}

\t\t\tconst serverEntryCode = generateServerEntry({
\t\t\t\troutes: loadedOctaneConfig.router.routes,
\t\t\t\toctaneConfigPath: getOctaneConfigPath(root),
\t\t\t\thtmlTemplatePath: './index.html',
\t\t\t\trpcModulePaths: [],
\t\t\t\tclientAssetMap,
\t\t\t});
\t\t\tconst serverEntryFile = write_project_generated_file(
\t\t\t\tconfig,
\t\t\t\t'server-entry.js',
\t\t\t\tserverEntryCode,
\t\t\t);

\t\t\tconst VIRTUAL_SERVER_ENTRY_ID = 'virtual:octane-server-entry';
\t\t\tconst RESOLVED_VIRTUAL_SERVER_ENTRY_ID = '\\0' + VIRTUAL_SERVER_ENTRY_ID;

\t\t\t/** @type {import('vite').Plugin} */
\t\t\tconst virtualEntryPlugin = {
\t\t\t\tname: 'octane-virtual-server-entry',
\t\t\t\tresolveId(id) {
\t\t\t\t\tif (id === VIRTUAL_SERVER_ENTRY_ID) return RESOLVED_VIRTUAL_SERVER_ENTRY_ID;
\t\t\t\t},
\t\t\t\tload(id) {
\t\t\t\t\tif (id === RESOLVED_VIRTUAL_SERVER_ENTRY_ID) {
\t\t\t\t\t\treturn fs.readFileSync(serverEntryFile, 'utf-8');
\t\t\t\t\t}
\t\t\t\t},
\t\t\t};

\t\t\tconst { createOctaneResolveShimsPlugin } = await import(
\t\t\t\tpath.join(root, 'patches/octane/resolve-shims-plugin.js')
\t\t\t);

\t\t\tconst serverOutDir = path.join(root, outDir, 'server');
\t\t\tconst { build: viteBuild } = await import('vite');

\t\t\ttry {
\t\t\t\tawait viteBuild({
\t\t\t\t\troot,
\t\t\t\t\tappType: 'custom',
\t\t\t\t\tplugins: [virtualEntryPlugin, createOctaneResolveShimsPlugin(root)],
\t\t\t\t\tbuild: {
\t\t\t\t\t\toutDir: serverOutDir,
\t\t\t\t\t\temptyOutDir: true,
\t\t\t\t\t\tssr: true,
\t\t\t\t\t\ttarget: loadedOctaneConfig?.build?.target,
\t\t\t\t\t\tminify: loadedOctaneConfig?.build?.minify ?? false,
\t\t\t\t\t\trollupOptions: {
\t\t\t\t\t\t\tinput: VIRTUAL_SERVER_ENTRY_ID,
\t\t\t\t\t\t\toutput: {
\t\t\t\t\t\t\t\tentryFileNames: ENTRY_FILENAME,
\t\t\t\t\t\t\t\tformat: 'esm',
\t\t\t\t\t\t\t},
\t\t\t\t\t\t},
\t\t\t\t\t},
\t\t\t\t\tssr: {
\t\t\t\t\t\t// Self-contained bundle — Vercel functions ship dist/server only.
\t\t\t\t\t\tnoExternal: true,
\t\t\t\t\t},
\t\t\t\t});

\t\t\t\tconst clientHtml = path.join(clientOutDir, 'index.html');
\t\t\t\tconst serverHtml = path.join(serverOutDir, 'index.html');
\t\t\t\tif (fs.existsSync(clientHtml)) {
\t\t\t\t\tfs.copyFileSync(clientHtml, serverHtml);
\t\t\t\t}

\t\t\t\tconsole.log('[@octanejs/vite-plugin] Server build complete.');
\t\t\t} catch (error) {
\t\t\t\tconsole.error('[@octanejs/vite-plugin] Server build failed:', error);
\t\t\t\tthrow error;
\t\t\t}
\t\t},
`;

	if (!viteIndex.includes('async buildStart()')) {
		viteIndex = viteIndex.replace(
			`\t\t/**
\t\t * HMR: let self-accepting client modules update normally; otherwise`,
			`${phase2Hooks}\n\t\t/**
\t\t * HMR: let self-accepting client modules update normally; otherwise`,
		);
	}

	viteIndex = `${PHASE2_MARKER}\n${viteIndex}`;
	await writeFile(viteIndexPath, viteIndex);
}

// Idempotent: skip server build when client build failed (no manifest).
let viteIndexCloseBundle = await readFile(viteIndexPath, 'utf8');
const closeBundleSkip = '\t\t\t\t);\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tconst collectCss';
if (
	viteIndexCloseBundle.includes('Client manifest not found at') &&
	!viteIndexCloseBundle.includes(closeBundleSkip)
) {
	viteIndexCloseBundle = viteIndexCloseBundle.replace(
		'\t\t\t\t);\n\t\t\t}\n\n\t\t\tconst collectCss',
		closeBundleSkip,
	);
	await writeFile(viteIndexPath, viteIndexCloseBundle);
}

// Idempotent: bundle npm deps into the server entry (Vercel has no node_modules).
let viteIndexSsrBundle = await readFile(viteIndexPath, 'utf8');
if (
	viteIndexSsrBundle.includes("external: ['@ripple-ts/adapter', '@octanejs/adapter-vercel']") &&
	viteIndexSsrBundle.includes('noExternal: [],')
) {
	viteIndexSsrBundle = viteIndexSsrBundle.replace(
		`ssr: {
						external: ['@ripple-ts/adapter', '@octanejs/adapter-vercel'],
						noExternal: [],
					},`,
		`ssr: {
						// Self-contained bundle — Vercel functions ship dist/server only.
						noExternal: true,
					},`,
	);
	await writeFile(viteIndexPath, viteIndexSsrBundle);
}

console.log('[patch-packages] patched octane runtime + @octanejs/vite-plugin (Phase 2)');
