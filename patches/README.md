# Local patches for octane@0.1.3

Upstream npm packages ship with packaging gaps and Phase 2 production build stubbed. This directory holds project-local fixes applied by [`scripts/patch-packages.mjs`](../scripts/patch-packages.mjs) on `postinstall` and before every build.

Run `bun run check` to validate all patches (format, lint, typecheck, build, tests, knip).

## Layout

| Path                                                                 | Applied to                              | Purpose                                      |
| -------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| [`octane/css-shim.js`](octane/css-shim.js)                           | Vite resolve (dev + server sub-build)   | Missing `octane/dist/css.js`                 |
| [`octane/rpc-shim.js`](octane/rpc-shim.js)                           | Vite resolve                            | Missing `octane/dist/server/rpc.js`          |
| [`octane/static-shim.js`](octane/static-shim.js)                     | Vite resolve                            | Missing `octane/dist/static/index.js`        |
| [`octane/resolve-shims-plugin.js`](octane/resolve-shims-plugin.js)   | `vite.config.ts` + Phase 2 server build | Wires the three shims above                  |
| [`octane/runtime-server-extras.js`](octane/runtime-server-extras.js) | `octane/dist/runtime.server.js`         | Missing server element utilities             |
| [`vite-plugin/production.js`](vite-plugin/production.js)             | `@octanejs/vite-plugin`                 | Phase 2 `createHandler` (upstream stub)      |
| [`vite-plugin/virtual-entry.js`](vite-plugin/virtual-entry.js)       | `@octanejs/vite-plugin`                 | Phase 2 server entry generator               |
| [`vite-plugin/load-config.js`](vite-plugin/load-config.js)           | `@octanejs/vite-plugin`                 | Node runtime injection for config load       |
| [`vite-plugin/node-runtime.js`](vite-plugin/node-runtime.js)         | `@octanejs/vite-plugin`                 | Node.js runtime primitives                   |
| [`vite-plugin/render-route.js`](vite-plugin/render-route.js)         | `@octanejs/vite-plugin`                 | TanStack Suspense, preHydrate, route status  |
| [`vite-plugin/project-codegen.js`](vite-plugin/project-codegen.js)   | `@octanejs/vite-plugin`                 | preHydrate client entry, adapter-vercel stub |
| [`dev/text-gen-ssr-stub.js`](dev/text-gen-ssr-stub.js)               | `vite.config.ts` only                   | Client-only motion component SSR stub        |
| [`dev/pwa-register-dev-stub.js`](dev/pwa-register-dev-stub.js)       | `vite.config.ts` only                   | PWA registration dev stub                    |

## Inline patches (in `patch-packages.mjs`)

| Target                               | Why kept                                              | Validated by                  |
| ------------------------------------ | ----------------------------------------------------- | ----------------------------- |
| `octane/dist/runtime*.js` exports    | `isChildrenBlock`, `flushSync`, element utils missing | component + integration tests |
| `vite-plugin/index.js` Phase 2 hooks | Production build not implemented upstream             | `bun run build`, e2e          |
| `should_skip_octane_routing`         | Catch-all route swallows Vite assets in dev           | manual `bun run dev`          |
| `routes.js` status field             | 404 catch-all HTTP status                             | e2e 404 test                  |
| ssr `noExternal: true`               | Vercel functions have no `node_modules`               | e2e production server         |
| `./node` package export              | Adapter node HTTP helpers                             | build                         |

## Removed in cleanup

| Removed                                                      | Reason                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `scripts/patch-octane.mjs`                                   | Duplicate of `patch-packages.mjs`                                  |
| `scripts/patch-vite-plugin-phase2.mjs`                       | Merged into `patch-packages.mjs`                                   |
| Postinstall writes for `css.js`, `rpc.js`, `static/index.js` | Replaced by Vite resolve shims                                     |
| `tanstack-router/Link.tsrx`                                  | Upstream Link works once `isChildrenBlock` is exported from octane |
| Root-level duplicate shim files                              | Moved to `octane/` and `dev/`                                      |

## Removal matrix results

Tested against `bun run check` after cleanup:

| Patch                              | Result                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `render-route.js` full override    | **Keep** — TanStack Suspense, url/preHydrate in hydration data            |
| `project-codegen.js` full override | **Keep** — preHydrate static import map + `@octanejs/adapter-vercel` stub |
| `routes.js` status                 | **Keep** — e2e expects 404 status                                         |
| `should_skip_octane_routing`       | **Keep** — dev asset routing                                              |
| Phase 2 production build           | **Keep** — upstream explicitly stubs this                                 |
| octane runtime injection           | **Keep** — published package missing exports                              |
| Vite shims for css/rpc/static      | **Keep** — replaces node_modules file writes                              |

## Upstream blockers (no PRs planned)

- `octane@0.1.3`: missing `dist/css.js`, `dist/server/rpc.js`, `dist/static/`, runtime exports
- `@octanejs/vite-plugin@0.1.3`: Phase 2 production build, dev asset skip, route status, adapter-vercel in codegen

Remove this directory and `patch-packages.mjs` once upstream releases fix these.
