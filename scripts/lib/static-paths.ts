import { join } from 'node:path';

/** Map a site path to a prerendered HTML file under the client output dir. */
export function htmlOutputPath(clientDir: string, routePath: string): string {
	if (routePath === '/') return join(clientDir, 'index.html');
	const segments = routePath.replace(/^\//, '').split('/');
	return join(clientDir, ...segments, 'index.html');
}
