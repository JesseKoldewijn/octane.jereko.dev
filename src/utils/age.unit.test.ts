import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAgeByDateString } from './age';

describe('getAgeByDateString', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-07-12T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns full years when birthday has passed this year', () => {
		expect(getAgeByDateString('1990-03-15')).toBe(36);
	});

	it('subtracts one year when birthday is still upcoming', () => {
		expect(getAgeByDateString('1990-12-25')).toBe(35);
	});

	it('handles same-month birthdays before the day', () => {
		expect(getAgeByDateString('1990-07-20')).toBe(35);
	});

	it('handles same-month birthdays on the day', () => {
		expect(getAgeByDateString('1990-07-12')).toBe(36);
	});
});
