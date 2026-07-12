export function e2eBaseUrl(): string {
	const base = process.env.E2E_BASE_URL;
	if (!base) {
		throw new Error('E2E_BASE_URL is not set. Did globalSetup run?');
	}
	return base;
}

export async function fetchRoute(pathname: string, init?: RequestInit) {
	const url = new URL(pathname, e2eBaseUrl());
	return fetch(url, init);
}
