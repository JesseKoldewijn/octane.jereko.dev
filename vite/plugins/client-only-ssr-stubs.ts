import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));

export function clientOnlySsrStubs(): Plugin {
	const textGenStub = path.resolve(root, 'scripts/stubs/text-gen-ssr-stub.js');

	return {
		name: 'client-only-ssr-stubs',
		enforce: 'pre',
		resolveId(source, _importer, options) {
			if (!options?.ssr) return null;
			if (source.endsWith('text-gen.tsrx') || source.includes('animated/text-gen.tsrx')) {
				return textGenStub;
			}
			return null;
		},
	};
}
