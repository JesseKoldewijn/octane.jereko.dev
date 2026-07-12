import { describe, expect, it } from 'vitest';

import { getServerRouterEntry, normalizePathname, warmServerRouter } from './router-server';

describe('normalizePathname', () => {
	it('adds a leading slash when missing', () => {
		expect(normalizePathname('projects')).toBe('/projects');
	});

	it('removes trailing slashes except for root', () => {
		expect(normalizePathname('/projects/')).toBe('/projects');
		expect(normalizePathname('/')).toBe('/');
	});
});

describe('server router cache', () => {
	it('warms and caches route entries', async () => {
		await warmServerRouter('/projects');

		const first = getServerRouterEntry('/projects');
		const second = getServerRouterEntry('/projects');

		expect(first.done).toBe(true);
		expect(second).toBe(first);
		expect(first.router.state.location.pathname).toBe('/projects');
	});

	it('loads nested about-me routes', async () => {
		await warmServerRouter('/about-me/hobbies');

		const entry = getServerRouterEntry('/about-me/hobbies');
		expect(entry.done).toBe(true);
		expect(entry.router.state.location.pathname).toBe('/about-me/hobbies');
	});
});
