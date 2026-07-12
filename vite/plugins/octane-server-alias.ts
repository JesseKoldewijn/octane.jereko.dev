import type { Plugin } from 'vite';

export function octaneServerAlias(): Plugin {
	return {
		name: 'octane-ssr-server-alias',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!options?.ssr || source !== 'octane') return null;
			const resolved = await this.resolve('octane/server', importer, {
				skipSelf: true,
			});
			return resolved?.id ?? null;
		},
	};
}
