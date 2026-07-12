import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

import {
	escapeCssForStyleTag,
	inlineStylesheets,
	inlineStylesheetsInHtml,
	preloadStylesheetsFromHtml,
} from './inline-stylesheets.ts';

describe('escapeCssForStyleTag', () => {
	it('escapes closing style tags inside CSS', () => {
		expect(escapeCssForStyleTag('body { content: "</style>"; }')).toBe(
			'body { content: "<\\/style>"; }',
		);
	});
});

describe('inlineStylesheetsInHtml', () => {
	it('replaces stylesheet links with style blocks using cached CSS', async () => {
		const html = '<head><link rel="stylesheet" href="/assets/app.css"></head>';
		const cssCache = new Map([['/assets/app.css', 'body{color:red}']]);

		const result = await inlineStylesheetsInHtml(html, '/tmp/client', {
			cssCache,
		});

		expect(result).toBe('<head><style>body{color:red}</style></head>');
	});

	it('inlines multiple links and reuses cached CSS', async () => {
		const html = [
			'<head>',
			'<link rel="stylesheet" href="/assets/app.css">',
			'<link rel="stylesheet" href="/assets/app.css">',
			'</head>',
		].join('');
		const cssCache = new Map([['/assets/app.css', '.x{color:blue}']]);

		const result = await inlineStylesheetsInHtml(html, '/tmp/client', {
			cssCache,
		});

		expect(result).toBe('<head><style>.x{color:blue}</style><style>.x{color:blue}</style></head>');
	});
});

describe('preloadStylesheetsFromHtml', () => {
	it('loads CSS files referenced by stylesheet links', async () => {
		const clientDir = await mkdtemp(join(tmpdir(), 'inline-css-'));
		await mkdir(join(clientDir, 'assets'), { recursive: true });
		await writeFile(join(clientDir, 'assets', 'app.css'), 'html{background:#fff}');

		const html = '<link rel="stylesheet" href="/assets/app.css">';
		const cache = await preloadStylesheetsFromHtml(html, clientDir);

		expect(cache.get('/assets/app.css')).toBe('html{background:#fff}');
	});

	it('throws when a stylesheet file is missing', async () => {
		const clientDir = await mkdtemp(join(tmpdir(), 'inline-css-'));
		const html = '<link rel="stylesheet" href="/assets/missing.css">';

		await expect(preloadStylesheetsFromHtml(html, clientDir)).rejects.toThrow(
			'Missing stylesheet file',
		);
	});
});

describe('inlineStylesheets', () => {
	it('preloads and inlines stylesheet links end-to-end', async () => {
		const clientDir = await mkdtemp(join(tmpdir(), 'inline-css-'));
		await mkdir(join(clientDir, 'assets'), { recursive: true });
		await writeFile(join(clientDir, 'assets', 'bundle.css'), 'main{display:block}');

		const html = '<head><link rel="stylesheet" href="/assets/bundle.css"></head>';
		const result = await inlineStylesheets(html, clientDir, { logLabel: 'index.html' });

		expect(result).toBe('<head><style>main{display:block}</style></head>');
	});
});
