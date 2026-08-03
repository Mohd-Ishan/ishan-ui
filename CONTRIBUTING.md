# Contributing to ishan-ui

## Setup

```bash
git clone https://github.com/ishan/ishan-ui.git
cd ishan-ui
npm install
```

## Development workflow

```bash
npm run typecheck    # tsc --noEmit against the strict build config
npm run lint          # ESLint, including the architecture's import-boundary rules
npm run test           # vitest run
npm run test:watch    # vitest watch mode
npm run build          # full production build + exports verification
```

Try changes against the example app (auto-reloads from source):

```bash
cd examples/vite-react-ts
npm install
npm run dev
```

## Architecture rules (non-negotiable)

This library follows a strict module-boundary architecture, enforced by
ESLint, not just convention:

1. **`components/<Name>/`** is a self-contained vertical slice — its own
   implementation, types, styles, config, internal hooks, internal sub-parts,
   and tests. It may import from `core/` and `shared/`, **never** from another
   component's folder.
2. **`core/`** holds library-wide primitives (config engine, routing, a11y).
   It may **never** import from `components/`.
3. **`shared/`** holds generic, component-agnostic utilities/hooks.
4. The **only** public surface is what's re-exported from `src/index.ts` (root)
   or a component's own `index.ts` (deep import). Internal files
   (`parts/`, private `hooks/`) are never exported.
5. Every component is **config-driven** — no hardcoded visual or behavioral
   value inside a `.tsx` file. If it's not in `<component>.config.ts`, it
   doesn't belong in the component.

Full rationale: [`docs/architecture/phase-1-architecture.md`](./docs/architecture/phase-1-architecture.md).

## Adding a new component

Copy the shape of `components/Navbar/` exactly:

```
components/<Name>/
  index.ts
  <Name>.tsx
  <Name>.types.ts
  <Name>.module.css
  <name>.config.ts
  <name>.constants.ts
  hooks/
  parts/
  __tests__/
```

Then:
1. Register it as a new Vite build entry in `vite.config.ts`.
2. Add its export path (`./<name>`) to `package.json#exports`.
3. Re-export its public types from `src/index.ts`.
4. Add `defineConfig.<name>` in `core/config/defineConfig.ts`.

## Commit & PR checklist

- [ ] `npm run typecheck && npm run lint && npm run test` all pass locally
- [ ] New/changed behavior has test coverage
- [ ] No `console.log` left in source (`console.warn`/`console.error` are fine)
- [ ] A changeset is included for any user-facing change:

```bash
npx changeset
```

Pick the correct bump type — patch (fix), minor (new feature, backward
compatible), or major (breaking change to public API or config shape).

## Code style

Formatting is enforced by Prettier (`npm run format:check` in CI) — run
`npm run format` before committing rather than hand-formatting.
