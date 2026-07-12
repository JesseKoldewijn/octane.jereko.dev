import { describe, expect, it } from 'vitest';

import { getYoutubeVideoId } from './youtube-id';

describe('getYoutubeVideoId', () => {
	it('extracts id from youtu.be links', () => {
		expect(getYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
	});

	it('extracts id from youtube.com watch URLs', () => {
		expect(getYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
	});

	it('extracts id from embed URLs', () => {
		expect(getYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
	});

	it('returns undefined for invalid URLs', () => {
		expect(getYoutubeVideoId('not-a-url')).toBeUndefined();
	});

	it('returns undefined for non-YouTube URLs', () => {
		expect(getYoutubeVideoId('https://example.com/video')).toBeUndefined();
	});
});
