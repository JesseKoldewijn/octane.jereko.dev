import { join } from 'node:path';

/**
 * Map a site path to a prerendered HTML file under the client output dir.
 * @param {string} clientDir
 * @param {string} routePath
 */
export function htmlOutputPath(clientDir, routePath) {
	if (routePath === '/') return join(clientDir, 'index.html');
	const segments = routePath.replace(/^\//, '').split('/');
	return join(clientDir, ...segments, 'index.html');
}
