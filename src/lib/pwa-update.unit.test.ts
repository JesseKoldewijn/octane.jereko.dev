import { describe, expect, it } from 'vitest';

import { compareBuildIds } from './pwa-update';

describe('compareBuildIds', () => {
	it('returns first-visit when no stored id exists', () => {
		expect(compareBuildIds(null, 'deploy-abc')).toBe('first-visit');
	});

	it('returns match when stored id equals current id', () => {
		expect(compareBuildIds('deploy-abc', 'deploy-abc')).toBe('match');
	});

	it('returns mismatch when stored id differs from current id', () => {
		expect(compareBuildIds('deploy-old', 'deploy-new')).toBe('mismatch');
	});
});
