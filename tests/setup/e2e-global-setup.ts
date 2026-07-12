import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

const PORT = Number(process.env.E2E_PORT ?? 4173);
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

async function waitForServer(url: string, timeoutMs = 60_000) {
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok || response.status === 404) return;
		} catch {
			/* server still starting */
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	throw new Error(`E2E server at ${url} did not become ready within ${timeoutMs}ms`);
}

let serverProcess: ChildProcess | undefined;
let viteServer: ViteDevServer | undefined;

export default async function globalSetup() {
	process.env.E2E_BASE_URL = BASE_URL;

	const staticIndex = path.join(process.cwd(), 'dist/client/index.html');
	const serverScript = path.join(process.cwd(), 'scripts/static-server.ts');

	if (fs.existsSync(staticIndex)) {
		serverProcess = spawn('bun', [serverScript], {
			env: { ...process.env, PORT: String(PORT), HOST, NODE_ENV: 'production' },
			stdio: ['ignore', 'pipe', 'pipe'],
		});
	} else {
		// No prerendered build — use Vite SSR dev server.
		viteServer = await createServer({
			configFile: path.join(process.cwd(), 'vite.config.ts'),
			server: {
				host: HOST,
				port: PORT,
				strictPort: true,
			},
		});
		await viteServer.listen();
	}

	await waitForServer(BASE_URL);

	return async () => {
		if (viteServer) {
			await viteServer.close();
			viteServer = undefined;
			return;
		}

		if (!serverProcess || serverProcess.killed) return;

		serverProcess.kill('SIGTERM');
		await new Promise<void>((resolve) => {
			serverProcess?.once('exit', () => resolve());
			setTimeout(() => {
				if (serverProcess && !serverProcess.killed) serverProcess.kill('SIGKILL');
				resolve();
			}, 5_000);
		});
	};
}
