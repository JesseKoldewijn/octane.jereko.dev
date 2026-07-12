import { describe, expect, it } from 'vitest';

import { pageForPathname } from './pages';

describe('pageForPathname', () => {
	it.each([
		['/', 'Home'],
		['/projects', 'Projects'],
		['/experience', 'Experience'],
		['/about-me', 'AboutMe'],
		['/about-me/hobbies', 'AboutMeHobbies'],
		['/about-me/volunteering', 'AboutMeVolunteering'],
		['/offline', 'Offline'],
	])('maps %s to %s', (pathname, exportName) => {
		const component = pageForPathname(pathname);
		expect(component).not.toBeNull();
		expect(component?.name).toBe(exportName);
	});

	it('normalizes trailing slashes', () => {
		expect(pageForPathname('/projects/')?.name).toBe('Projects');
	});

	it('returns null for unknown routes', () => {
		expect(pageForPathname('/missing-page')).toBeNull();
	});
});
