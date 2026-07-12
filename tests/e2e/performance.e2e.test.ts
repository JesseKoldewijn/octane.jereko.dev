import { describe, expect, it } from 'vitest';

import { assertPerformanceAudits } from '../lighthouse/budgets';
import { runLighthouse } from '../lighthouse/run-lighthouse';
import { e2eBaseUrl } from './helpers';

describe('performance', () => {
	it('homepage passes Lighthouse audit budgets', async () => {
		const url = new URL('/', e2eBaseUrl()).href;
		const lhr = await runLighthouse(url);

		try {
			assertPerformanceAudits(lhr);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			expect.fail(`Lighthouse performance budgets failed for ${url}: ${message}`);
		}
	}, 120_000);
});
