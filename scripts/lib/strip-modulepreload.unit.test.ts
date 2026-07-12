import { describe, expect, it } from 'vitest';

import { stripModulepreloadLinks } from './strip-modulepreload.ts';

describe('stripModulepreloadLinks', () => {
	it('removes a single modulepreload link', () => {
		const html =
			'<head><link rel="modulepreload" href="/assets/App-abc.js"><script type="module" src="/assets/index.js"></script></head>';

		expect(stripModulepreloadLinks(html)).toBe(
			'<head><script type="module" src="/assets/index.js"></script></head>',
		);
	});

	it('removes multiple modulepreload links', () => {
		const html = [
			'<head>',
			'<link rel="modulepreload" href="/assets/App-abc.js">',
			'<link rel=\'modulepreload\' href="/assets/Other-def.js">',
			'<script type="module" src="/assets/index.js"></script>',
			'</head>',
		].join('');

		expect(stripModulepreloadLinks(html)).toBe(
			'<head><script type="module" src="/assets/index.js"></script></head>',
		);
	});

	it('leaves stylesheet, manifest, and script tags untouched', () => {
		const html = [
			'<head>',
			'<link rel="stylesheet" href="/assets/style.css">',
			'<link rel="manifest" href="/manifest.webmanifest">',
			'<script type="module" src="/assets/index.js"></script>',
			'</head>',
		].join('');

		expect(stripModulepreloadLinks(html)).toBe(html);
	});

	it('is idempotent on already-clean HTML', () => {
		const html = '<head><script type="module" src="/assets/index.js"></script></head>';

		expect(stripModulepreloadLinks(html)).toBe(html);
		expect(stripModulepreloadLinks(stripModulepreloadLinks(html))).toBe(html);
	});
});
