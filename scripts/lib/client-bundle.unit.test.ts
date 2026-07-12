import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const clientAssetsDir = path.join(process.cwd(), 'dist/client/assets');

function readClientBundles(): {
	indexSource: string;
	appSource: string;
	indexFile: string;
	appFile: string;
} {
	const indexFile = fs
		.readdirSync(clientAssetsDir)
		.find((name) => name.startsWith('index-') && name.endsWith('.js'));
	const appFile = fs
		.readdirSync(clientAssetsDir)
		.find((name) => name.startsWith('App-') && name.endsWith('.js'));

	if (!indexFile || !appFile) {
		throw new Error('Expected built client entry and App chunks in dist/client/assets');
	}

	return {
		indexFile,
		appFile,
		indexSource: fs.readFileSync(path.join(clientAssetsDir, indexFile), 'utf8'),
		appSource: fs.readFileSync(path.join(clientAssetsDir, appFile), 'utf8'),
	};
}

describe('client entry bundle', () => {
	it('keeps the App chunk out of a circular import with the hydrate entry', () => {
		const { indexSource, appSource, indexFile, appFile } = readClientBundles();
		const indexChunkId = indexFile.replace(/\.js$/, '');
		const appChunkId = appFile.replace(/\.js$/, '');

		expect(indexSource).toContain(appChunkId);
		expect(appSource).not.toContain(indexChunkId);
		expect([...appSource.matchAll(/import\([^)]+\)/g)]).toHaveLength(0);
	});
});
