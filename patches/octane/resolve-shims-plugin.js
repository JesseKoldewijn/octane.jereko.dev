import path from 'node:path';

/**
 * Resolve missing octane dist files via project shims (dev SSR + production server sub-build).
 * @param {string} projectRoot
 */
export function createOctaneResolveShimsPlugin(projectRoot) {
	const patchesOctane = path.join(projectRoot, 'patches/octane');

	return {
		name: 'octane-resolve-shims',
		enforce: 'pre',
		resolveId(source, importer) {
			if (source === 'octane/static') {
				return path.join(patchesOctane, 'static-shim.js');
			}
			if (!importer?.includes('octane/dist')) return null;
			if (source === './rpc.js' && importer.includes('octane/dist/server')) {
				return path.join(patchesOctane, 'rpc-shim.js');
			}
			if (source === './css.js') {
				return path.join(patchesOctane, 'css-shim.js');
			}
			return null;
		},
	};
}
