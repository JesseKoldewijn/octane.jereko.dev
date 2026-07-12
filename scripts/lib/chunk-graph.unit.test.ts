import { describe, expect, it } from 'vitest';

import {
	assertHealthyClientChunkGraph,
	findIndexChunk,
	formatChunkGraphIssues,
	parseClientChunkGraph,
} from './chunk-graph.ts';

describe('client chunk graph', () => {
	it('has no hydrate-entry imports or circular chunk dependencies', () => {
		assertHealthyClientChunkGraph();
	});

	it('documents the current client chunk graph for debugging', () => {
		const graph = parseClientChunkGraph();
		const indexChunk = findIndexChunk(graph);
		expect(indexChunk).toBeTruthy();
		expect(formatChunkGraphIssues(graph)).toEqual([]);
	});
});
