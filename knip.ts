import type { KnipConfig } from 'knip';

/** Strip Octane @-syntax so Knip can parse imports/exports in .tsrx files. */
function compileTsrx(source: string): string {
	return source
		.replace(/\)\s*@\{/g, ') { return null; //')
		.replace(/@if\b/g, 'if')
		.replace(/@else if\b/g, 'else if')
		.replace(/@else\b/g, 'else')
		.replace(/@for\b/g, 'for')
		.replace(/@switch\b/g, 'switch');
}

const config = {
	entry: [
		'index.html',
		'src/app/App.tsrx',
		'src/app/pages.ts',
		'src/app/router.ts',
		'src/app/router-client.ts',
		'src/app/router-server.ts',
		'src/components/animated/text-gen.tsrx',
		'octane.config.ts',
		'src/config/routes.ts',
		'scripts/*.ts',
		'scripts/**/*.unit.test.ts',
		'src/**/*.unit.test.ts',
		'src/**/*.integration.test.ts',
		'src/**/*.component.test.tsx',
		'tests/e2e/**/*.e2e.test.ts',
		'tests/lighthouse/**/*.ts',
		'tests/setup/**/*.ts',
	],
	project: ['src/**/*.{ts,tsx,tsrx}', 'scripts/**/*.ts', 'vite/**/*.ts', 'tests/**/*.{ts,tsx}'],
	compilers: {
		tsrx: compileTsrx,
	},
	ignore: [
		// Tailwind v4 @source scans (components not wired into the app shell).
		'src/components/layout/Layout.tsrx',
		'src/components/layout/SiteShellHead.tsrx',
		'src/components/layout/navbar/NavbarPlaceholder.tsrx',
	],
	ignoreDependencies: [
		'@tailwindcss/typography',
		'tailwindcss',
		'tailwindcss-animate',
		'platformicons',
		'devalue',
		// Bundled separately from @octanejs/motion (see vite.config.ts ssr.external).
		'motion',
	],
	ignoreExportsUsedInFile: true,
	ignoreBinaries: ['act'],
	ignoreIssues: {
		'src/data/**': ['types'],
		'src/data/navigation.ts': ['exports'],
		'src/components/layout/navbar/mobile-nav.ts': ['exports'],
	},
} satisfies KnipConfig;

export default config;
