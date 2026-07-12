/**
 * Virtual server entry generator for octane production builds.
 */

import {
	get_route_entry_export_name,
	get_route_entry_id,
	get_route_entry_path,
} from '../routes.js';

/**
 * @param {Object} options
 * @param {import('@octanejs/vite-plugin').Route[]} options.routes
 * @param {string} options.octaneConfigPath
 * @param {string} options.htmlTemplatePath
 * @param {string[]} [options.rpcModulePaths]
 * @param {Record<string, { js: string, css: string[] }>} [options.clientAssetMap]
 */
export function generateServerEntry(options) {
	const {
		routes,
		octaneConfigPath,
		htmlTemplatePath,
		rpcModulePaths = [],
		clientAssetMap = {},
	} = options;

	/** @type {Map<string, string>} */
	const component_imports = new Map();
	/** @type {Map<string, string>} */
	const layout_imports = new Map();
	/** @type {Map<string, string>} */
	const rpc_imports = new Map();

	let component_index = 0;
	let layout_index = 0;
	let rpc_index = 0;

	for (const route of routes) {
		if (route.type === 'render') {
			const entryPath = get_route_entry_path(route.entry);
			if (entryPath && !component_imports.has(entryPath)) {
				component_imports.set(entryPath, `_page_${component_index++}`);
			}
			if (typeof route.layout === 'string' && !layout_imports.has(route.layout)) {
				layout_imports.set(route.layout, `_layout_${layout_index++}`);
			}
		}
	}

	for (const rpcPath of rpcModulePaths) {
		if (!component_imports.has(rpcPath) && !rpc_imports.has(rpcPath)) {
			rpc_imports.set(rpcPath, `_rpc_${rpc_index++}`);
		}
	}

	const import_lines = [];
	for (const [entry, varName] of component_imports) {
		import_lines.push(`import * as ${varName} from ${JSON.stringify(entry)};`);
	}
	for (const [layout, varName] of layout_imports) {
		import_lines.push(`import * as ${varName} from ${JSON.stringify(layout)};`);
	}
	for (const [rpcPath, varName] of rpc_imports) {
		import_lines.push(`import * as ${varName} from ${JSON.stringify(rpcPath)};`);
	}

	const component_entries = routes
		.filter((route) => route.type === 'render')
		.map((route) => {
			const entryId = get_route_entry_id(route.entry);
			const entryPath = get_route_entry_path(route.entry);
			const exportName = get_route_entry_export_name(route.entry);
			const varName = entryPath ? component_imports.get(entryPath) : undefined;
			if (!entryId || !varName) return null;
			return `  ${JSON.stringify(entryId)}: getComponentExport(${varName}, ${JSON.stringify(exportName)}),`;
		})
		.filter(Boolean)
		.join('\n');

	const layout_entries = [...layout_imports]
		.map(([layout, varName]) => `  ${JSON.stringify(layout)}: getComponentExport(${varName}),`)
		.join('\n');

	const rpcPathSet = new Set(rpcModulePaths);
	const rpc_entries = [];
	for (const [entry, varName] of component_imports) {
		if (rpcPathSet.has(entry)) {
			rpc_entries.push(`rpcModules[${JSON.stringify(entry)}] = ${varName}._$_server_$_;`);
		}
	}
	for (const [rpcPath, varName] of rpc_imports) {
		rpc_entries.push(`rpcModules[${JSON.stringify(rpcPath)}] = ${varName}._$_server_$_;`);
	}

	return `\
// Auto-generated server entry for production build
// Do not edit — regenerated on each build

import { executeServerFunction } from 'octane/server';
import { prerender } from 'octane/static';
import { createHandler, resolveOctaneConfig } from '@octanejs/vite-plugin/production';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import _rawOctaneConfig from ${JSON.stringify(octaneConfigPath)};

${import_lines.join('\n')}

let octaneConfig;
try {
  octaneConfig = resolveOctaneConfig(_rawOctaneConfig, { requireAdapter: true });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

function getComponentExport(mod, exportName) {
  if (exportName && typeof mod[exportName] === 'function') return mod[exportName];
  if (typeof mod.default === 'function') return mod.default;
  for (const [key, value] of Object.entries(mod)) {
    if (typeof value === 'function' && /^[A-Z]/.test(key)) return value;
  }
  return null;
}

const components = {
${component_entries}
};

const layouts = {
${layout_entries}
};

const rpcModules = {};
${rpc_entries.join('\n')}

const __dirname = dirname(fileURLToPath(import.meta.url));
if (!existsSync(join(__dirname, ${JSON.stringify(htmlTemplatePath)}))) {
  console.error('[octane] HTML template not found:', join(__dirname, ${JSON.stringify(htmlTemplatePath)}));
  process.exit(1);
}
const htmlTemplate = readFileSync(join(__dirname, ${JSON.stringify(htmlTemplatePath)}), 'utf-8');

const clientAssets = ${JSON.stringify(clientAssetMap, null, 2)};

const handler = createHandler(
  {
    routes: octaneConfig.router.routes,
    components,
    layouts,
    middlewares: octaneConfig.middlewares,
    rpcModules,
    trustProxy: octaneConfig.server.trustProxy,
    rootBoundary: octaneConfig.rootBoundary,
    runtime: octaneConfig.adapter.runtime,
    clientAssets,
    preHydrate: octaneConfig.router.preHydrate ?? null,
  },
  {
    render: prerender,
    htmlTemplate,
    executeServerFunction,
  },
);

export { handler };

const isMainModule = typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMainModule) {
  if (octaneConfig.adapter?.serve) {
    const server = octaneConfig.adapter.serve(handler, {
      static: { dir: join(__dirname, '../client') },
    });
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('[octane] Invalid PORT value:', process.env.PORT);
      process.exit(1);
    }
    server.listen(port);
    console.log('[octane] Production server listening on port ' + port);
  } else {
    console.error('[octane] No serve() on adapter — use octane-preview or a serverless wrapper.');
    process.exit(1);
  }
}
`;
}
