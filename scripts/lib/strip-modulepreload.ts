const MODULEPRELOAD_RE = /<link\b[^>]*\brel=["']modulepreload["'][^>]*>\s*/gi;

/** Remove redundant modulepreload hints (hydrate entry loads route chunks itself). */
export function stripModulepreloadLinks(html: string): string {
	const result = html.replace(MODULEPRELOAD_RE, '');
	if (result !== html) {
		console.log('[strip-modulepreload] removed modulepreload link(s)');
	}
	return result;
}
