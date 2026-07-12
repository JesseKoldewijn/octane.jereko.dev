import { describe, expect, it } from 'vitest';

import { getMetaForPath, pageMeta, SITE_URL } from './meta';

describe('getMetaForPath', () => {
	it('returns home meta for /', () => {
		expect(getMetaForPath('/').title).toBe(pageMeta['/'].title);
	});

	it('normalizes trailing slashes', () => {
		expect(getMetaForPath('/projects/')).toEqual(pageMeta['/projects']);
	});

	it('returns route-specific meta', () => {
		expect(getMetaForPath('/experience').title).toBe('Experience | Jereko');
	});

	it('returns 404 meta for unknown routes', () => {
		const meta = getMetaForPath('/does-not-exist');
		expect(meta.title).toBe('404 | Jereko');
		expect(meta.description).toContain('could not be found');
	});

	it('uses the production site URL in canonical tags via middleware consumer', () => {
		expect(SITE_URL).toBe('https://jereko.dev');
	});
});
