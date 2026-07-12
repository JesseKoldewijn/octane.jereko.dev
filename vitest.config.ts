import path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfigExport from './vite.config';

export default defineConfig(async (configEnv) => {
	const viteUserConfig =
		typeof viteConfigExport === 'function'
			? await viteConfigExport({
					...configEnv,
					command: 'serve',
					mode: configEnv.mode ?? 'test',
				})
			: viteConfigExport;

	return mergeConfig(
		viteUserConfig,
		defineConfig({
			resolve: {
				alias: {
					'@': path.resolve(__dirname, 'src'),
					'@tests': path.resolve(__dirname, 'tests'),
				},
			},
			test: {
				passWithNoTests: false,
				projects: [
					{
						extends: true,
						test: {
							name: 'unit',
							include: ['src/**/*.unit.test.ts'],
							environment: 'node',
						},
					},
					{
						extends: true,
						test: {
							name: 'integration',
							include: ['src/**/*.integration.test.ts'],
							environment: 'node',
						},
					},
					{
						extends: true,
						test: {
							name: 'component',
							include: ['src/**/*.component.test.{ts,tsx}'],
							environment: 'happy-dom',
							setupFiles: ['./tests/setup/component-setup.ts'],
						},
					},
					{
						extends: true,
						test: {
							name: 'e2e',
							include: ['tests/e2e/**/*.e2e.test.ts'],
							environment: 'node',
							globalSetup: ['./tests/setup/e2e-global-setup.ts'],
							testTimeout: 30_000,
							hookTimeout: 120_000,
						},
					},
				],
			},
		}),
	);
});
