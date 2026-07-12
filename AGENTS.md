# AGENTS.md

Development standards for **octane.jereko.dev** — a TypeScript-first web app built with [Octane](https://octanejs.dev/).

## Project Overview

This project uses Octane as its UI framework, TypeScript for all application code, and Tailwind CSS for styling. Octane provides React's programming model (hooks, context, Suspense, transitions) with ahead-of-time compilation and no virtual DOM.

## Octane LLM Reference

**Fetch this URL before writing or modifying any Octane UI code:**

https://octanejs.dev/llms.txt

Re-fetch when unsure about hooks, events, bindings, `.tsrx` syntax, or API differences from React.

## Tech Stack

| Technology                      | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| [Octane](https://octanejs.dev/) | UI framework (`.tsrx` / `.tsx`)                  |
| TypeScript                      | Application language (strict mode)               |
| Tailwind CSS v4                 | Utility-first styling                            |
| Vite                            | Build tool and dev server                        |
| `@octanejs/vite-plugin`         | Optional metaframework (routing, SSR, hydration) |
| Vitest                          | Unit and component tests                         |
| `@octanejs/testing-library`     | Component testing (React Testing Library port)   |

## Development Commands

Update this table once `package.json` scripts are defined:

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `bun run dev`       | Start development server        |
| `bun run build`     | Production build                |
| `bun run typecheck` | Run TypeScript without emitting |
| `bun run test`      | Run Vitest                      |
| `bun run lint`      | Run Oxlint                      |

## Critical Rules

1. **Fetch the Octane reference** — https://octanejs.dev/llms.txt — before UI work and when Octane API questions arise.
2. **Use Octane bindings, not React packages** — reach for `@octanejs/*` ports instead of reinstalling React ecosystem libraries (see [Ecosystem](#ecosystem-bindings)).
3. **Prefer `.tsrx` for collection-heavy UI** — compiled `@for` loops avoid per-row descriptor allocation.
4. **Use native DOM events** — `onInput` for text inputs, not React's synthetic `onChange`.
5. **Pass refs as props** — `ref={cb}` / `ref={obj}`; there is no `forwardRef`.
6. **Keep diffs focused** — match existing patterns; do not refactor unrelated code.
7. **Validate external data** — use Zod (or equivalent) at system boundaries.
8. **ESLint and TypeScript errors are blocking** — fix before considering work done.

---

## Octane Framework

> **Fetch before editing UI:** https://octanejs.dev/llms.txt
>
> **Additional docs:** https://octanejs.dev/docs/quick-start · https://octanejs.dev/docs/tsrx-vs-tsx · https://octanejs.dev/docs/differences-from-react · https://octanejs.dev/docs/bindings

### Authoring

- A **component** is any function used at a `<Component />` site — no special declaration required.
- **`@{ … }`** is shorthand for returning JSX; setup (hooks, locals) can sit next to the template output.
- Use **`.tsrx`** when you need template control flow (`@if`, `@for`, `@switch`, `@try`) or optimized list rendering.
- Use **`.tsx`** when authoring standard JSX or porting existing React components.

```tsx
import { useState } from 'octane';

export function Counter() @{
  const [count, setCount] = useState(0);

  <button onClick={() => setCount(count + 1)}>
    {'Count: ' + count}
  </button>
}
```

### Hooks

Octane exposes the same hook API as React: `useState`, `useEffect`, `useMemo`, `useRef`, `useId`, `useTransition`, `useDeferredValue`, context, and the actions API.

Unlike React, **hooks are not bound by the rules of hooks** — a hook may sit behind a condition or after an early return. A hook inside a plain JS `for`/`while` loop is a **compile error**; use `@for` or extract a child component instead.

### Events and Forms

- Events are **native and delegated** (`onClick`, `onInput`, `onSubmit`) — no synthetic event layer.
- There is **no synthetic `onChange`**. For controlled text inputs, use **`onInput`** (fires per keystroke).
- Controlled inputs follow React semantics: `value` / `checked` drive the DOM; use `defaultValue` / `defaultChecked` for uncontrolled inputs.

### Refs and Styling

- Refs are **props** (React 19 style): `ref={callback}`, `ref={object}`, or `ref={[a, b]}`.
- `class` and `className` compose clsx-style (strings, arrays, objects; falsy values drop out).

### Template Control Flow (`.tsrx`)

```tsx
export function Feed(props: { items: Item[] }) @{
  <ul>
    @for (const item of props.items; key item.id) {
      <li>{item.title as string}</li>
    } @empty {
      <li>Nothing to show</li>
    }
  </ul>
}
```

- Dynamic text holes: `{expr as string}` when the expression is not provably a string.
- Plain JS control flow stays in setup; rendered control flow uses `@if`, `@for`, `@switch`, `@try`.

### What Octane Does Not Have

- No class components
- No Server Components
- No StrictMode double-invoke
- No `forwardRef`

Octane is **alpha software** — APIs may change. Prefer patterns from https://octanejs.dev/llms.txt (fetch the URL for the current source of truth).

---

## TypeScript Standards

### Compiler Options

- Enable **strict mode** (`strict: true`).
- Prefer **`noUncheckedIndexedAccess`** and **`exactOptionalPropertyTypes`** when the project supports them.
- Use **ES modules** (`"type": "module"`).

### Types and Interfaces

- Prefer **`interface`** for object shapes that may be extended; use **`type`** for unions, intersections, and mapped types.
- Avoid `any`. Use `unknown` at boundaries and narrow with type guards or Zod.
- Export types alongside the modules that define them; avoid barrel-file re-export sprawl unless already established.
- Prefer **`satisfies`** over widening assertions when preserving literal types.

```typescript
// Good — explicit, narrow
function parseId(raw: string): string | null {
	const trimmed = raw.trim();
	return trimmed.length > 0 ? trimmed : null;
}

// Avoid
function parseId(raw: any) {
	return raw.trim();
}
```

### Functions and Modules

- Prefer **`const` + arrow functions** for callbacks and small helpers; use **`function`** declarations for hoisted utilities and components.
- Use **named exports** by default; default exports only when the file has a single primary export (e.g. route components).
- Colocate types with implementation unless shared across features.

### Path Aliases

Use `@/` for `src/` once configured:

```typescript
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
```

### Async and Errors

- Prefer **`async/await`** over raw Promise chains.
- Handle errors at boundaries; do not swallow exceptions silently.
- Use discriminated unions or Result-style returns for expected failure paths in domain logic.

---

## Tailwind CSS Standards

This project uses **Tailwind CSS v4** with CSS-first configuration.

### Setup Pattern

Define design tokens and Tailwind in a global stylesheet (typically `src/styles/global.css`):

```css
@import 'tailwindcss';

@theme {
	--color-surface: oklch(0.98 0 0);
	--color-surface-muted: oklch(0.95 0 0);
	--color-accent: oklch(0.55 0.2 250);
	--font-sans: 'Inter', system-ui, sans-serif;
}
```

### Utility Usage

- Use **utility classes in components**; avoid `@apply` except for repeated, semantic primitives (e.g. `.btn-primary`).
- Prefer **Tailwind's design tokens** (`bg-surface`, `text-accent`) over arbitrary values when tokens exist.
- Use **`cn()` / clsx-style helpers** only when class logic is non-trivial; Octane already composes `class`/`className` natively.

```tsx
<button
	class={{
		'rounded-lg px-4 py-2 font-medium transition-colors': true,
		'bg-accent text-white hover:bg-accent/90': !disabled,
		'cursor-not-allowed opacity-50': disabled,
	}}
>
	{label as string}
</button>
```

### Responsive and State Variants

- Mobile-first breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
- Use `hover:`, `focus-visible:`, `active:`, and `dark:` consistently — do not rely on `:hover` alone for critical affordances.
- Group related utilities: layout → spacing → typography → color → effects.

### Accessibility

- Never convey state by color alone; pair with text, icons, or `aria-*` attributes.
- Ensure **focus-visible** styles on all interactive elements.
- Respect **`prefers-reduced-motion`** for animations (Tailwind `motion-reduce:` variant or CSS `@media`).

### Avoid

- Inline `style={{ … }}` when an equivalent utility exists.
- Magic pixel values scattered across components — promote repeated values to `@theme` tokens.
- Deeply nested `@apply` chains that obscure the rendered output.

---

## Code Style

### Formatting

Follow Prettier defaults unless the project config says otherwise:

- 2-space indentation
- Single quotes
- Semicolons enabled
- Trailing commas (ES5)
- Print width ~100

### Naming

| Kind       | Convention                              | Example           |
| ---------- | --------------------------------------- | ----------------- |
| Components | PascalCase                              | `UserAvatar.tsx`  |
| Hooks      | camelCase, `use` prefix                 | `useAuth.ts`      |
| Utilities  | camelCase                               | `formatDate.ts`   |
| Constants  | SCREAMING_SNAKE or camelCase            | `MAX_RETRIES`     |
| CSS tokens | kebab-case                              | `--color-surface` |
| Files      | kebab-case or PascalCase for components | `user-menu.tsx`   |

### Comments

- Code should be mostly self-explanatory.
- Comment **why**, not **what** — especially for non-obvious business rules or compiler workarounds.
- Do not leave commented-out code in commits.

### File Organization

```
src/
├── components/       # Shared UI components
│   └── ui/           # Primitive, unstyled or lightly styled building blocks
├── features/         # Feature-scoped modules (components + logic)
├── lib/              # Framework-agnostic utilities
├── styles/           # Global CSS, Tailwind entry
├── App.tsrx          # Root component
└── main.ts           # Client entry
```

- Keep **domain logic framework-agnostic** in `lib/` or `features/*/logic.ts`.
- Colocate feature-specific components under `features/<name>/`.

---

## Ecosystem Bindings

When implementing functionality that maps to a well-known React library, **use the Octane binding** — do not install the React package or write a custom wrapper.

| Need                  | Use                                                            |
| --------------------- | -------------------------------------------------------------- |
| Global state          | `@octanejs/zustand`                                            |
| Server/async state    | `@octanejs/tanstack-query`                                     |
| Routing               | `@octanejs/tanstack-router` or `@octanejs/vite-plugin` routing |
| Animation             | `@octanejs/motion`                                             |
| Atomic CSS (StyleX)   | `@octanejs/stylex`                                             |
| Rich text             | `@octanejs/lexical`                                            |
| Tooltips / popovers   | `@octanejs/floating-ui`                                        |
| Accessible primitives | `@octanejs/radix` or `@octanejs/base-ui`                       |
| Charts                | `@octanejs/recharts`                                           |
| MDX                   | `@octanejs/mdx`                                                |
| Testing               | `@octanejs/testing-library`                                    |

Import path change is usually the only migration step (e.g. `@tanstack/react-query` → `@octanejs/tanstack-query`).

---

## Testing

- **Unit / component tests:** Vitest + `@octanejs/testing-library`
- **E2E tests:** Playwright (when configured)
- Test **behavior and accessibility**, not implementation details.
- Prefer `userEvent` / `fireEvent` patterns from `@octanejs/testing-library`.

```typescript
import { render, fireEvent } from '@octanejs/testing-library';
import { Counter } from '@/components/counter';

it('increments on click', () => {
  const { getByRole } = render(<Counter />);
  fireEvent.click(getByRole('button'));
  expect(getByRole('button')).toHaveTextContent('Count: 1');
});
```

Add tests when they cover meaningful behavior — not for trivial pass-through wrappers.

---

## Common Pitfalls

| Pitfall                                | Correct approach                                   |
| -------------------------------------- | -------------------------------------------------- |
| Using `onChange` on text inputs        | Use `onInput` (native DOM event)                   |
| Installing React ecosystem packages    | Use the matching `@octanejs/*` binding             |
| Hooks inside JS loops                  | Use `@for` in `.tsrx` or extract a child component |
| Using `forwardRef`                     | Pass `ref` as a regular prop                       |
| Ignoring `{expr as string}` in `.tsrx` | Cast dynamic text holes when not provably string   |
| Arbitrary Tailwind values everywhere   | Promote repeated values to `@theme` tokens         |
| Business logic inside components       | Extract to `lib/` or `features/*/logic.ts`         |
| Large unrelated refactors in a fix PR  | Keep changes scoped to the task                    |

---

## Agent Workflow

1. Fetch https://octanejs.dev/llms.txt before Octane UI work; re-fetch when API or binding questions come up.
2. Inspect surrounding code before adding new patterns.
3. Run typecheck, lint, and tests before finishing.
4. Update this file's **Development Commands** table when project scripts are added.
