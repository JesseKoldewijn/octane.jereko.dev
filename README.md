# octane.jereko.dev

Personal website for [Jereko](https://jereko.dev), built with [Octane](https://octanejs.dev/), TypeScript, and Tailwind CSS v4. Deployed to Vercel via `@octanejs/adapter-vercel`.

## Requirements

- Node.js 20+
- [Bun](https://bun.sh/) 1.3+

```bash
bun install
bun run dev
```

## Scripts

| Command                    | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| `bun run dev`              | Start the Vite dev server with SSR                             |
| `bun run build`            | Production build (assets, sitemap, Vercel output)              |
| `bun run preview`          | Preview the production build locally                           |
| `bun run typecheck`        | Run TypeScript in strict mode                                  |
| `bun run test`             | Run unit, integration, and component tests                     |
| `bun run test:unit`        | Run unit tests only                                            |
| `bun run test:integration` | Run integration tests only                                     |
| `bun run test:component`   | Run component tests (Octane Testing Library)                   |
| `bun run test:e2e`         | Run e2e tests (SSR via production server or Vite dev fallback) |
| `bun run test:all`         | Run every test suite including e2e                             |
| `bun run test:watch`       | Run tests in watch mode                                        |
| `bun run lint`             | Run Oxlint                                                     |
| `bun run lint:fix`         | Run Oxlint with auto-fix                                       |
| `bun run format`           | Format the repo with Oxfmt                                     |
| `bun run format:check`     | Check formatting without writing                               |
| `bun run knip`             | Find unused files, exports, and dependencies                   |
| `bun run check`            | Run format, lint, typecheck, test, and knip                    |

## Project layout

- `src/app/` — Octane app shell and router client
- `src/pages/` — Route pages (`.tsrx`)
- `src/components/` — UI components
- `src/data/` — Static site content
- `public/` — Static assets
- `scripts/` — Build-time asset helpers and npm patch runner
- `tests/` — Shared test setup and e2e specs
- `patches/` — Local fixes for octane@0.1.3 packaging gaps (see [`patches/README.md`](patches/README.md))

## Testing

Vitest runs four projects:

| Layer       | File pattern                   | What it covers                                    |
| ----------- | ------------------------------ | ------------------------------------------------- |
| Unit        | `src/**/*.unit.test.ts`        | Pure functions, data queries, config helpers      |
| Integration | `src/**/*.integration.test.ts` | Routing, SSR middleware, server router cache      |
| Component   | `src/**/*.component.test.tsx`  | Octane components via `@octanejs/testing-library` |
| E2E         | `tests/e2e/**/*.e2e.test.ts`   | Full SSR responses from the production server     |

E2E tests start a local SSR server automatically. When `dist/server/entry.js` exists (future Octane production server bundle), that entry is used; otherwise the Vite dev server is started for SSR route checks.

Interactive component tests use `data-testid` selectors defined in `src/testids.ts`. Prefer `byTestId()` from `@tests/setup/test-utils` over role/text/class queries.

## License

MIT — see [LICENSE](./LICENSE).
