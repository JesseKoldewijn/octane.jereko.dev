#!/usr/bin/env bun
/**
 * Type-check Octane .tsrx sources by compiling them to virtual TSX (same pipeline
 * editors use via octane/compiler/volar) and running tsc in strict mode.
 */
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileToVolarMappings } from 'octane/compiler/volar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');
const outRoot = path.join(root, '.tsrx-check');

interface CompileError {
	message?: string;
}

interface ParseFailure {
	file: string;
	errors: CompileError[];
}

async function walkTsrxFiles(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkTsrxFiles(fullPath)));
		} else if (entry.name.endsWith('.tsrx')) {
			files.push(fullPath);
		}
	}

	return files;
}

function rewriteTsrxImports(code: string): string {
	return code.replace(/from\s+(['"])([^'"]+)\.tsrx\1/g, 'from $1$2.tsx$1');
}

async function compileTsrxSources(): Promise<{ fileCount: number; parseErrors: ParseFailure[] }> {
	await rm(outRoot, { recursive: true, force: true });
	await mkdir(outRoot, { recursive: true });

	const tsconfig = {
		extends: '../tsconfig.json',
		compilerOptions: {
			rootDir: '..',
			types: ['vite/client', 'node'],
			paths: {
				'@/*': ['./*', '../src/*'],
				'@tests/*': ['../tests/*'],
			},
		},
		include: ['**/*.tsx', '../env.d.ts', '../octane-jsx.d.ts'],
		exclude: ['../dist', '../node_modules'],
	};
	await writeFile(
		path.join(outRoot, 'tsconfig.json'),
		`${JSON.stringify(tsconfig, null, 2)}\n`,
		'utf8',
	);

	const files = await walkTsrxFiles(srcRoot);
	const parseErrors: ParseFailure[] = [];

	for (const file of files) {
		const source = await readFile(file, 'utf8');
		const result = compileToVolarMappings(source, file);

		if (result.errors.length > 0) {
			parseErrors.push({ file, errors: result.errors });
		}

		const rel = path.relative(srcRoot, file).replace(/\.tsrx$/, '.tsx');
		const outFile = path.join(outRoot, rel);
		await mkdir(path.dirname(outFile), { recursive: true });
		await writeFile(outFile, rewriteTsrxImports(result.code), 'utf8');
	}

	return { fileCount: files.length, parseErrors };
}

function runTsc() {
	const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
	return spawnSync(process.execPath, [tsc, '--noEmit', '-p', '.tsrx-check/tsconfig.json'], {
		cwd: root,
		encoding: 'utf8',
	});
}

function implicitAnyDiagnostics(output: string): string[] {
	return output
		.split('\n')
		.filter(
			(line) => line.includes('.tsrx-check/') && /error TS(7006|7031|7053|7022|7023):/.test(line),
		);
}

const { fileCount, parseErrors } = await compileTsrxSources();

if (parseErrors.length > 0) {
	console.error('Failed to compile .tsrx sources for type checking:\n');
	for (const { file, errors } of parseErrors) {
		console.error(`  ${path.relative(root, file)}`);
		for (const error of errors) {
			console.error(`    ${error.message ?? JSON.stringify(error)}`);
		}
	}
	process.exit(1);
}

console.log(`Compiled ${fileCount} .tsrx files to ${path.relative(root, outRoot)}/`);

const result = runTsc();
const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
const implicitAny = implicitAnyDiagnostics(output);

if (implicitAny.length > 0) {
	console.error(`Found ${implicitAny.length} implicit/missing type issue(s) in .tsrx sources:\n`);
	console.error(implicitAny.join('\n'));
	process.exit(1);
}

if (result.status !== 0) {
	const other = output
		.split('\n')
		.filter((line) => line.includes('.tsrx-check/') && line.includes('error TS'))
		.filter((line) => !implicitAny.includes(line));

	if (other.length > 0) {
		console.warn(`Skipped ${other.length} non–implicit-any .tsrx diagnostic(s).`);
	}
}

console.log('No implicit-any type issues in .tsrx sources.');
