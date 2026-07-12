/** Shim for missing octane/dist/css.js in npm package 0.1.3 */

export function normalizeClass(value) {
	if (value == null || value === false) return '';
	if (typeof value === 'string' || typeof value === 'number') return String(value);
	if (Array.isArray(value)) {
		return value.map(normalizeClass).filter(Boolean).join(' ');
	}
	if (typeof value === 'object') {
		return Object.entries(value)
			.filter(([, v]) => v)
			.map(([k]) => k)
			.join(' ');
	}
	return '';
}

export function styleName(name) {
	if (name.startsWith('--')) return name;
	return name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
