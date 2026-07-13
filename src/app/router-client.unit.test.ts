// @vitest-environment happy-dom

import { createMemoryHistory } from '@octanejs/tanstack-router';
import { describe, expect, it } from 'vitest';

import { makeRouter } from './router';

describe('client router bootstrap', () => {
	it('initializes stores when created in client mode with history', async () => {
		const history = createMemoryHistory({ initialEntries: ['/projects'] });
		const router = makeRouter({ isServer: false, history });

		expect(router.stores?.__store).toBeDefined();
		expect(router.state.location.pathname).toBe('/projects');

		await router.load();
		expect(router.state.location.pathname).toBe('/projects');
	});

	it('does not initialize stores when isServer is true without history', () => {
		const router = makeRouter({ isServer: true });

		expect(router.stores).toBeUndefined();
		expect(() => router.state).toThrow();
	});
});
