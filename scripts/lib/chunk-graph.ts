import fs from 'node:fs';
import path from 'node:path';

const CLIENT_ASSETS_DIR = path.join(process.cwd(), 'dist/client/assets');

export type ChunkGraph = Record<string, string[]>;

export function listClientChunks(assetsDir = CLIENT_ASSETS_DIR): string[] {
	return fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js'));
}

/** Parse static `from"./chunk.js"` edges between built client chunks. */
export function parseClientChunkGraph(assetsDir = CLIENT_ASSETS_DIR): ChunkGraph {
	const graph: ChunkGraph = {};

	for (const file of listClientChunks(assetsDir)) {
		const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
		const deps = [...source.matchAll(/from"\.\/([^"]+\.js)"/g).map((match) => match[1] as string)];
		graph[file] = deps;
	}

	return graph;
}

export function findIndexChunk(graph: ChunkGraph): string | undefined {
	return Object.keys(graph).find((file) => file.startsWith('index-'));
}

export function findChunkCycles(graph: ChunkGraph): string[][] {
	const cycles: string[][] = [];
	const visiting = new Set<string>();
	const visited = new Set<string>();
	const stack: string[] = [];

	function dfs(node: string): void {
		if (visited.has(node)) return;
		if (visiting.has(node)) {
			const start = stack.indexOf(node);
			if (start !== -1) cycles.push(stack.slice(start).concat(node));
			return;
		}

		visiting.add(node);
		stack.push(node);

		for (const dep of graph[node] ?? []) {
			if (!(dep in graph)) continue;
			dfs(dep);
		}

		stack.pop();
		visiting.delete(node);
		visited.add(node);
	}

	for (const node of Object.keys(graph)) dfs(node);
	return cycles;
}

export function formatChunkGraphIssues(graph: ChunkGraph): string[] {
	const issues: string[] = [];
	const indexChunk = findIndexChunk(graph);

	if (indexChunk) {
		for (const [chunk, deps] of Object.entries(graph)) {
			if (chunk === indexChunk) continue;
			if (deps.includes(indexChunk)) {
				issues.push(`${chunk} imports hydrate entry ${indexChunk}`);
			}
		}
	}

	for (const cycle of findChunkCycles(graph)) {
		issues.push(`circular chunk import: ${cycle.join(' -> ')}`);
	}

	return issues;
}

export function assertHealthyClientChunkGraph(assetsDir = CLIENT_ASSETS_DIR): void {
	if (!fs.existsSync(assetsDir)) {
		throw new Error(`Expected built client assets at ${assetsDir}. Run "bun run build" first.`);
	}

	const graph = parseClientChunkGraph(assetsDir);
	const issues = formatChunkGraphIssues(graph);
	if (issues.length > 0) {
		throw new Error(`Unhealthy client chunk graph:\n- ${issues.join('\n- ')}`);
	}
}
