# octane.jereko.dev

Personal website for [Jereko](https://jereko.dev), built with [Octane](https://octanejs.dev/), TypeScript, and Tailwind CSS v4. Deployed to Vercel as a static site (SSG).

## Requirements

- Node.js 20+
- [Bun](https://bun.sh/) 1.3+

```bash
bun install
bun run dev
```

## Scripts

| Command                    | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `bun run dev`              | Start the Vite dev server with SSR                                   |
| `bun run build`            | Production build (prerender HTML, static Vercel output)              |
| `bun run preview`          | Preview the prerendered static build locally                         |
| `bun run typecheck`        | Type-check `.ts`/`.tsx` (tsc) and `.tsrx` (Octane Volar pipeline)    |
| `bun run typecheck:tsrx`   | Type-check `.tsrx` components only                                   |
| `bun run test`             | Run unit, integration, and component tests                           |
| `bun run test:unit`        | Run unit tests only                                                  |
| `bun run test:integration` | Run integration tests only                                           |
| `bun run test:component`   | Run component tests (Octane Testing Library)                         |
| `bun run test:e2e`         | Run e2e tests (static server or Vite dev fallback)                   |
| `bun run test:all`         | Run every test suite including e2e                                   |
| `bun run test:watch`       | Run tests in watch mode                                              |
| `bun run lint`             | Run Oxlint with type-aware rules and TypeScript diagnostics          |
| `bun run lint:fix`         | Run Oxlint with auto-fix (type-aware)                                |
| `bun run format`           | Format the repo with Oxfmt                                           |
| `bun run format:check`     | Check formatting without writing                                     |
| `bun run knip`             | Find unused files, exports, and dependencies                         |
| `bun run check`            | Run format, lint, typecheck (`.ts` + `.tsrx`), build, test, and knip |

## Type checking

Linting uses **Oxlint type-aware mode** (`oxlint-tsgolint`) for `.ts`/`.tsx` — it runs TypeScript diagnostics and rules like `typescript/no-unsafe-*` alongside standard lint rules.

`.tsrx` Octane components are checked separately: `scripts/typecheck-tsrx.mjs` compiles each file through Octane’s Volar pipeline (same as the editor) and fails on implicit `any` (e.g. untyped `props`). Run `bun run typecheck:tsrx` to see only those issues.

## Project layout

- `src/app/` — Octane app shell and router client
- `src/pages/` — Route pages (`.tsrx`)
- `src/components/` — UI components
- `src/config/` — Shared route list, page meta, and site config
- `src/data/` — Static site content
- `public/` — Static assets
- `scripts/` — Build-time helpers (Tailwind sources, sitemap, prerender, Vercel adapt)
- `tests/` — Shared test setup and e2e specs

## Testing

Vitest runs four projects:

| Layer       | File pattern                   | What it covers                                    |
| ----------- | ------------------------------ | ------------------------------------------------- |
| Unit        | `src/**/*.unit.test.ts`        | Pure functions, data queries, config helpers      |
| Integration | `src/**/*.integration.test.ts` | Routing, SSR middleware, server router cache      |
| Component   | `src/**/*.component.test.tsx`  | Octane components via `@octanejs/testing-library` |
| E2E         | `tests/e2e/**/*.e2e.test.ts`   | Prerendered HTML responses from the static server |

E2E tests start a local static file server when `dist/client/index.html` exists; otherwise the Vite dev server is used for route checks.

Interactive component tests use `data-testid` selectors defined in `src/testids.ts`. Prefer `byTestId()` from `@tests/setup/test-utils` over role/text/class queries.

## License

MIT — see [LICENSE](./LICENSE).
