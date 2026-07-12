import type Result from 'lighthouse/types/lhr/lhr.js';

type NetworkRequestItem = {
	url?: string;
	transferSize?: number;
};

function auditScore(lhr: Result, auditId: string): number | null {
	const score = lhr.audits[auditId]?.score;
	return typeof score === 'number' ? score : null;
}

function assertAuditPerfectScore(lhr: Result, auditIds: string[], label: string): void {
	for (const auditId of auditIds) {
		const score = auditScore(lhr, auditId);
		if (score === null) continue;
		if (score < 1) {
			const title = lhr.audits[auditId]?.title ?? auditId;
			throw new Error(`${label}: expected "${auditId}" (${title}) score 1, got ${score}.`);
		}
		return;
	}

	throw new Error(
		`${label}: none of [${auditIds.join(', ')}] were present in the Lighthouse report.`,
	);
}

function networkRequestItems(lhr: Result): NetworkRequestItem[] {
	const details = lhr.audits['network-requests']?.details;
	if (!details || !('items' in details) || !Array.isArray(details.items)) {
		return [];
	}

	return details.items as NetworkRequestItem[];
}

function assertNoDuplicateChunkTransfers(lhr: Result, chunkPattern: string, label: string): void {
	const items = networkRequestItems(lhr);
	const transfersByUrl = new Map<string, number>();

	for (const item of items) {
		const url = item.url ?? '';
		const transferSize = item.transferSize ?? 0;
		if (!url.includes(chunkPattern) || transferSize <= 0) continue;
		transfersByUrl.set(url, (transfersByUrl.get(url) ?? 0) + 1);
	}

	const duplicates = [...transfersByUrl.entries()].filter(([, count]) => count > 1);
	if (duplicates.length > 0) {
		const detail = duplicates.map(([url, count]) => `${url} (${count} transfers)`).join(', ');
		throw new Error(
			`${label} double-fetch regression: multiple network transfers with bytes for ${detail}.`,
		);
	}
}

function assertNoDuplicateAppTransfers(lhr: Result): void {
	assertNoDuplicateChunkTransfers(lhr, '/assets/App-', 'App chunk');
}

function assertNoDuplicateFrameworkTransfers(lhr: Result): void {
	assertNoDuplicateChunkTransfers(lhr, '/assets/framework-', 'Framework chunk');
}

export function assertPerformanceAudits(lhr: Result): void {
	assertAuditPerfectScore(
		lhr,
		['render-blocking-insight', 'render-blocking-resources'],
		'Render blocking',
	);
	assertNoDuplicateAppTransfers(lhr);
	assertNoDuplicateFrameworkTransfers(lhr);
}
