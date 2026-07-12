/**
 * Default Node.js runtime primitives for production SSR.
 * Vercel adapter does not export runtime — these match @ripple-ts/adapter-node.
 */
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

/** @type {import('@ripple-ts/adapter').RuntimePrimitives} */
export const runtime = {
	hash(str) {
		return createHash('sha256').update(str).digest('hex').slice(0, 8);
	},
	createAsyncContext() {
		const als = new AsyncLocalStorage();
		return {
			run: (store, fn) => als.run(store, fn),
			getStore: () => als.getStore(),
		};
	},
};
