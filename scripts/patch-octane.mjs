#!/usr/bin/env node
/**
 * Patches missing files in the published octane@0.1.3 npm package.
 * Remove this script once upstream fixes the packaging.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(path.resolve(__dirname, '..'), 'node_modules/octane/dist');

const rpcJs = `import * as devalue from 'devalue';

export async function executeServerFunction(fn, body) {
  const args = devalue.parse(body);
  const value = await fn.apply(null, args);
  return devalue.stringify({ value });
}
`;

const cssJs = `export function normalizeClass(value) {
  if (value == null || value === false) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(' ');
  if (typeof value === 'object') {
    return Object.entries(value).filter(([, v]) => v).map(([k]) => k).join(' ');
  }
  return '';
}

export function styleName(name) {
  if (name.startsWith('--')) return name;
  return name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
`;

const staticIndexJs = `export { prerender } from '../runtime.server.js';
`;

await mkdir(path.join(dist, 'server'), { recursive: true });
await mkdir(path.join(dist, 'static'), { recursive: true });

await writeFile(path.join(dist, 'server', 'rpc.js'), rpcJs);
await writeFile(path.join(dist, 'css.js'), cssJs);
await writeFile(path.join(dist, 'static', 'index.js'), staticIndexJs);

console.log('[patch-octane] patched missing octane dist files');
