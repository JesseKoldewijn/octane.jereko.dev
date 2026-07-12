import { launch as launchChrome } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import type Result from 'lighthouse/types/lhr/lhr.js';

const CHROME_FLAGS = ['--headless', '--no-sandbox', '--disable-gpu'] as const;

export async function runLighthouse(url: string): Promise<Result> {
	const chromePath = process.env.CHROME_PATH;
	const chrome = await launchChrome({
		...(chromePath ? { chromePath } : {}),
		chromeFlags: [...CHROME_FLAGS],
	});

	try {
		const runnerResult = await lighthouse(
			url,
			{
				port: chrome.port,
				output: 'json',
				onlyCategories: ['performance'],
				formFactor: 'mobile',
				screenEmulation: { mobile: true },
			},
			undefined,
		);

		if (!runnerResult?.lhr) {
			throw new Error(`Lighthouse did not return a result for ${url}`);
		}

		return runnerResult.lhr;
	} finally {
		await chrome.kill();
	}
}
