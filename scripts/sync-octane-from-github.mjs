#!/usr/bin/env node
/**
 * Clone octanejs/octane into vendor/ and rewrite pnpm catalog:/workspace:* deps.
 *
 * Committed stub package.json files under vendor/octane/packages/ let Bun resolve
 * file: deps before this script runs (preinstall). Git coordinates live in
 * package.json `octaneSource`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const vendorDir = path.join(root, 'vendor', 'octane');

/** @param {string} cmd @param {string[]} args @param {import('node:child_process').ExecFileSyncOptions} [opts] */
function run(cmd, args, opts = {}) {
	execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

/** @param {string} yamlText */
function parsePnpmCatalog(yamlText) {
	/** @type {Record<string, string>} */
	const anchors = {};
	/** @type {Record<string, string>} */
	const catalog = {};

	for (const line of yamlText.split('\n')) {
		const anchorDef = line.match(/^\s*(\S+):\s*&(\w+)\s+(.+)$/);
		if (anchorDef) {
			anchors[anchorDef[2]] = anchorDef[3].trim().replace(/^['"]|['"]$/g, '');
		}
	}

	const lines = yamlText.split('\n');
	let inCatalogs = false;
	let inDefault = false;

	for (const line of lines) {
		if (/^catalogs:\s*$/.test(line)) {
			inCatalogs = true;
			inDefault = false;
			continue;
		}
		if (inCatalogs && /^  default:\s*$/.test(line)) {
			inDefault = true;
			continue;
		}
		if (inDefault && /^[^\s#]/.test(line)) {
			break;
		}
		if (!inDefault) continue;

		const alias = line.match(/^\s+['"]?([^'":\s]+)['"]?:\s*\*(\w+)\s*$/);
		if (alias && anchors[alias[2]]) {
			catalog[alias[1]] = anchors[alias[2]];
			continue;
		}

		const entry = line.match(/^\s+['"]?([^'":\s]+)['"]?:\s*(.+?)\s*$/);
		if (!entry) continue;

		let value = entry[2].trim().replace(/^['"]|['"]$/g, '');
		if (value.startsWith('*')) {
			value = anchors[value.slice(1)] ?? value;
		}
		catalog[entry[1]] = value;
	}

	return catalog;
}

/** @param {string} fromDir @param {string} toDir */
function workspaceFileSpec(fromDir, toDir) {
	const rel = path.relative(fromDir, toDir).split(path.sep).join('/');
	return `file:${rel.startsWith('.') ? rel : `./${rel}`}`;
}

/**
 * @param {Record<string, string>} packageDirs name -> repo-relative directory
 * @param {string} dir
 * @param {Record<string, string>} catalog
 */
function resolvePackageManifest(packageDirs, dir, catalog) {
	const manifestPath = path.join(dir, 'package.json');
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	let changed = false;

	for (const field of [
		'dependencies',
		'devDependencies',
		'peerDependencies',
		'optionalDependencies',
	]) {
		const deps = manifest[field];
		if (!deps || typeof deps !== 'object') continue;

		for (const [name, spec] of Object.entries(deps)) {
			if (typeof spec !== 'string') continue;

			if (spec === 'workspace:*' || spec.startsWith('workspace:')) {
				const targetDir = packageDirs[name];
				if (!targetDir) {
					throw new Error(
						`Missing workspace mapping for ${name} (required by ${manifest.name ?? dir})`,
					);
				}
				const next = workspaceFileSpec(dir, path.join(vendorDir, targetDir));
				if (deps[name] !== next) {
					deps[name] = next;
					changed = true;
				}
				continue;
			}

			if (spec.startsWith('catalog:')) {
				const resolved = catalog[name];
				if (!resolved) {
					throw new Error(`Unknown catalog entry for ${name}@${spec} in ${manifest.name ?? dir}`);
				}
				if (deps[name] !== resolved) {
					deps[name] = resolved;
					changed = true;
				}
			}
		}
	}

	if (changed) {
		writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	}
}

/** @returns {{ source: { repository: string, ref: string }, packageDirs: Record<string, string> }} */
function readOctaneConfig() {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
	const source = pkg.octaneSource ?? {
		repository: 'https://github.com/octanejs/octane.git',
		ref: 'main',
	};

	/** @type {Record<string, string>} */
	const packageDirs = { ...pkg.octaneSource?.packages };

	for (const field of ['dependencies', 'devDependencies']) {
		const deps = pkg[field];
		if (!deps) continue;

		for (const [name, spec] of Object.entries(deps)) {
			if (typeof spec !== 'string' || !spec.startsWith('file:./vendor/octane/')) continue;
			const subpath = spec.slice('file:./vendor/octane/'.length);
			packageDirs[name] = subpath;
		}
	}

	if (Object.keys(packageDirs).length === 0) {
		throw new Error('No Octane packages configured in octaneSource.packages');
	}

	return { source, packageDirs };
}

/** @param {{ repository: string, ref: string }} source @returns {boolean} */
function syncClone(source) {
	const gitDir = path.join(vendorDir, '.git');

	if (!existsSync(gitDir)) {
		if (existsSync(vendorDir)) {
			rmSync(vendorDir, { recursive: true, force: true });
		}
		run('git', ['clone', '--depth', '1', '--branch', source.ref, source.repository, vendorDir]);
		return true;
	}

	run('git', ['fetch', 'origin', source.ref, '--depth', '1'], { cwd: vendorDir });
	run('git', ['checkout', 'FETCH_HEAD'], { cwd: vendorDir });
	return false;
}

/** Re-link file: deps after replacing install stubs with the real clone. */
function relinkWorkspacePackages() {
	run('bun', ['install', '--ignore-scripts'], { cwd: root });
}

function main() {
	const { source, packageDirs } = readOctaneConfig();

	const freshClone = syncClone(source);

	const workspaceYaml = readFileSync(path.join(vendorDir, 'pnpm-workspace.yaml'), 'utf8');
	const catalog = parsePnpmCatalog(workspaceYaml);

	for (const dirRel of new Set(Object.values(packageDirs))) {
		const dir = path.join(vendorDir, dirRel);
		if (!existsSync(dir)) {
			throw new Error(`Expected package directory missing: ${dirRel}`);
		}
		resolvePackageManifest(packageDirs, dir, catalog);
	}

	if (freshClone) {
		console.log('[octane:sync] relinking workspace packages after clone…');
		relinkWorkspacePackages();
	}

	const head = execFileSync('git', ['rev-parse', 'HEAD'], {
		cwd: vendorDir,
		encoding: 'utf8',
	}).trim();

	writeFileSync(
		path.join(root, 'vendor', '.octane-ref'),
		`${head} ${source.ref} ${new Date().toISOString()}\n`,
	);

	console.log(`Synced octane from ${source.repository}@${source.ref} (${head.slice(0, 12)})`);
}

main();
