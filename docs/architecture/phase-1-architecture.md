# ishan-ui — Phase 1: Library Architecture

> Scope: architecture only. No components, no JSX, no CSS, no animation logic.
> This document is the contract that Phase 2 (Navbar implementation) and all future
> components (Button, Sidebar, Modal, Drawer, Dropdown, Toast, Card, Input, Avatar,
> Tooltip, Tabs, Accordion...) must conform to.

---

## 1. Complete Folder Structure

```
ishan-ui/
├── .changeset/                          # Changesets for versioning + changelog automation
│   └── config.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                       # lint, typecheck, test, build on every PR
│       └── release.yml                  # publish to npm on merge to main via changesets
│
├── docs/                                # Human docs, not shipped in the package
│   ├── architecture/
│   │   ├── phase-1-architecture.md      # this document, versioned in-repo
│   │   └── decisions/                   # ADRs (Architecture Decision Records)
│   │       └── 0001-config-driven-components.md
│   └── components/
│       └── navbar.md                    # per-component usage docs (added in Phase 2)
│
├── examples/                            # Standalone example apps, NOT part of the package
│   └── vite-react-ts/                   # sandbox app that imports ishan-ui via workspace link
│       ├── src/
│       └── package.json
│
├── scripts/                             # Repo tooling (build helpers, release checks)
│   ├── build.mjs
│   └── verify-exports.mjs               # asserts package.json "exports" map matches dist output
│
├── src/                                 # THE LIBRARY SOURCE — everything here gets built to dist/
│   │
│   ├── index.ts                         # ROOT PUBLIC API — the only file consumers implicitly trust
│   │
│   ├── components/                      # One folder per component. Fully isolated, no cross-imports
│   │   │                                # between component folders except through shared/ and core/.
│   │   │
│   │   └── Navbar/                      # (created in Phase 2 — placeholder only in Phase 1)
│   │       ├── index.ts                 # local public API / barrel for this component
│   │       ├── Navbar.tsx               # component implementation (Phase 2)
│   │       ├── Navbar.types.ts          # component-specific prop & type contracts
│   │       ├── Navbar.module.css        # CSS Module, scoped styles
│   │       ├── navbar.config.ts         # DEFAULT config + config contract for Navbar
│   │       ├── navbar.constants.ts      # non-configurable internal constants (z-index keys, etc.)
│   │       ├── hooks/                   # component-private hooks (useScrollDirection, etc.)
│   │       │   └── useNavbarState.ts
│   │       ├── parts/                   # internal sub-components (Logo, NavLinks, MobileDock...)
│   │       │   ├── NavbarLogo.tsx
│   │       │   ├── NavbarLinks.tsx
│   │       │   └── NavbarCta.tsx
│   │       └── __tests__/
│   │           ├── Navbar.test.tsx
│   │           └── navbar.config.test.ts
│   │
│   │   # Future sibling folders (same shape as Navbar/), added incrementally:
│   │   # ├── Button/
│   │   # ├── Sidebar/
│   │   # ├── Modal/
│   │   # ├── Drawer/
│   │   # ├── Dropdown/
│   │   # ├── Toast/
│   │   # ├── Card/
│   │   # ├── Input/
│   │   # ├── Avatar/
│   │   # ├── Tooltip/
│   │   # ├── Tabs/
│   │   # └── Accordion/
│   │
│   ├── core/                            # Library-wide primitives every component depends on
│   │   ├── config/
│   │   │   ├── createConfig.ts          # generic deep-merge(user, defaults) config factory
│   │   │   ├── defineConfig.ts          # type-safe helper devs use to author *.config.ts files
│   │   │   └── config.types.ts          # DeepPartial<T>, ConfigResolver<T>, etc.
│   │   │
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx        # optional global context (theme, tokens, breakpoints)
│   │   │   ├── theme.types.ts           # Theme, ColorScheme, Breakpoints contracts
│   │   │   ├── defaultTheme.ts          # library-wide default design tokens
│   │   │   └── useTheme.ts
│   │   │
│   │   ├── tokens/                      # Raw design tokens consumed by theme + components
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── radii.ts
│   │   │   ├── shadows.ts
│   │   │   ├── zIndex.ts                # centralized z-index scale (avoids magic numbers)
│   │   │   └── breakpoints.ts
│   │   │
│   │   ├── routing/
│   │   │   └── useOptionalRouter.ts     # safe wrapper: works with/without react-router present
│   │   │
│   │   └── a11y/
│   │       ├── focusTrap.ts
│   │       └── ariaHelpers.ts
│   │
│   ├── shared/                          # Cross-component reusable building blocks (NOT primitives)
│   │   ├── hooks/
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useLockBodyScroll.ts
│   │   │   └── usePrefersReducedMotion.ts
│   │   ├── utils/
│   │   │   ├── cx.ts                    # classnames/className merge utility
│   │   │   ├── mergeRefs.ts
│   │   │   └── deepMerge.ts
│   │   └── types/
│   │       └── common.types.ts          # shared prop shapes: WithClassName, WithChildren, etc.
│   │
│   ├── styles/                          # Library-level global CSS (opt-in, not auto-injected)
│   │   ├── reset.css                    # minimal, scoped reset consumers can opt into
│   │   └── variables.css                # CSS custom properties mapped from tokens/
│   │
│   └── types/
│       └── global.d.ts                  # ambient types (CSS module declarations, etc.)
│
├── tests/
│   ├── setup.ts                         # vitest + jsdom + testing-library setup
│   └── test-utils.tsx                   # custom render() wrapping providers
│
├── dist/                                # BUILD OUTPUT — gitignored, generated by Vite
│   ├── index.js                         # ESM bundle
│   ├── index.cjs                        # CJS bundle
│   ├── index.d.ts                       # rolled-up type declarations
│   └── style.css                        # extracted CSS (if not using CSS-in-JS)
│
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── .npmignore
├── tsconfig.json                        # base config (editor/tooling)
├── tsconfig.build.json                  # strict build-only config used for dist type generation
├── vite.config.ts                       # library mode build config
├── vitest.config.ts
├── package.json
├── LICENSE
└── README.md
```

### Why `src/components/<Name>/` is self-contained
Each component folder is a **vertical slice**: implementation, types, styles, config, internal
hooks, internal sub-parts, and tests all live together. This is what lets the library scale to
20+ components without folders like `hooks/`, `styles/`, or `types/` becoming unmaintainable
junk drawers shared across unrelated components. Cross-cutting concerns only live in `core/` or
`shared/` — never inside another component's folder.

### Why `core/` and `shared/` are separate
- **`core/`** = things the library's *identity* depends on (config engine, theming, tokens,
  routing abstraction, accessibility primitives). Rarely changes. Every component may depend on
  `core/`, but `core/` never depends on any component.
- **`shared/`** = generic reusable utilities/hooks that just happen to be useful across
  components (media query hook, click-outside hook). These are conveniences, not identity.

This split follows the Dependency Inversion Principle: components depend on abstractions in
`core/`, not the other way around.

---

## 2. Package Architecture

### Guiding principles applied
- **Single Responsibility** — each file has one reason to change (a component's visual output,
  its config contract, its types, and its styles are four separate files, not one).
- **Open/Closed** — components are extended via `config` objects and composition (`parts/`),
  never by editing the component's internal source to add a use case.
- **Liskov Substitution** — every component's config type extends a common `BaseComponentConfig`
  shape from `core/config`, so config-consuming logic (merge, validation) works identically
  across all components.
- **Interface Segregation** — public prop types (`Navbar.types.ts`) expose only what a consumer
  needs; internal-only types stay in the component folder and are never exported from the root.
- **Dependency Inversion** — components depend on `core/theme`, `core/config`, `core/routing`
  abstractions, never on a concrete app's router, store, or global CSS.

### Module boundaries (enforced by import rules, see §6)
1. `components/*` → may import from `core/*`, `shared/*` — never from another `components/*`.
2. `core/*` → may import from `shared/*` only for generic utils — never from `components/*`.
3. `shared/*` → depends on nothing internal except `types/`.
4. `index.ts` (root) → the only file allowed to import from multiple `components/*` folders.

This turns accidental circular dependencies and "God folder" drift into a lint-time error rather
than a runtime bug discovered by a consumer.

---

## 3. Export Strategy

### 3.1 Root barrel (`src/index.ts`)
The root barrel is the **entire public surface area** of the package. Nothing is public unless
it is explicitly re-exported here. Pattern for Phase 2+:

```ts
// src/index.ts  (shape only — not implemented yet)

// Components
export { Navbar } from "./components/Navbar";
export type { NavbarProps } from "./components/Navbar";
export type { NavbarConfig } from "./components/Navbar";

// Config helpers (public, used to author *.config.ts files)
export { defineConfig } from "./core/config/defineConfig";

// Theming (optional, for consumers who want a shared design system)
export { ThemeProvider, useTheme } from "./core/theme";
export type { Theme } from "./core/theme";
```

Both consumption styles the spec asked for are supported simultaneously:
```ts
import { Navbar } from "ishan-ui";        // named export — preferred, tree-shakeable
import Navbar from "ishan-ui";            // default export — convenience alias, see below
```
The default export is implemented as `export default Navbar` re-pointed at the same named
export — never a separate implementation — so there is exactly one source of truth.

### 3.2 Deep imports (secondary entry points)
For consumers who want to avoid pulling in the whole library's type surface, or who use tools
that don't tree-shake well, each component also gets its own package export path:

```ts
import { Navbar } from "ishan-ui/navbar";
```

This is wired through `package.json`'s `exports` map (§7), each pointing at its own built
sub-bundle. This is the same pattern used by Radix UI and MUI.

### 3.3 What is never exported
- Anything inside a component's `parts/` folder.
- Anything inside `hooks/` inside a component folder (component-private).
- `core/` internals beyond the explicit public helpers (`defineConfig`, `ThemeProvider`,
  `useTheme`). Tokens and raw theme internals stay private so they can be refactored freely.

---

## 4. Configuration Architecture

### 4.1 Design goal
No component ever hardcodes a visual or behavioral value. Every knob is expressed through a
typed config object with library-defined defaults, deep-mergeable with user overrides.

### 4.2 Generic config engine (`core/config`)
```ts
// core/config/config.types.ts (shape only)
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface BaseComponentConfig {
  theme?: "light" | "dark" | "transparent" | "glass" | (string & {});
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: string;
  };
  accessibility?: {
    ariaLabel?: string;
    reduceMotion?: "auto" | "always" | "never";
  };
  responsive?: {
    mobileBreakpoint?: number;
  };
}
```

```ts
// core/config/createConfig.ts (shape only)
export function createConfig<T extends object>(defaults: T) {
  return (overrides?: DeepPartial<T>): T => deepMerge(defaults, overrides ?? {});
}
```

`createConfig` is generic and component-agnostic — it is what every future component's
`*.config.ts` is built on, guaranteeing identical merge semantics library-wide.

### 4.3 Per-component config contract — `navbar.config.ts` (Phase 2 will implement values)
```ts
// components/Navbar/navbar.config.ts  (CONTRACT ONLY — no implementation yet)
import { createConfig } from "../../core/config/createConfig";
import type { BaseComponentConfig } from "../../core/config/config.types";

export interface NavbarConfig extends BaseComponentConfig {
  layout: {
    position: "sticky" | "floating" | "static";
    dockPosition?: "top" | "bottom";
    containerWidth: string;
    heightDesktop: number;
    heightMobile: number;
  };
  appearance: {
    variant: "light" | "dark" | "transparent" | "glass";
    glassOpacity: number;
    blur: number;
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg";
    spacing: number;
    accentColor: string;
  };
  brand: {
    logo?: string;
    name?: string;
    href?: string;
  };
  navigation: {
    items: NavItemConfig[];
  };
  profile?: {
    enabled: boolean;
    avatarUrl?: string;
    menuItems?: NavItemConfig[];
  };
  cta?: {
    enabled: boolean;
    label?: string;
    href?: string;
  };
  behavior: {
    hideOnRoutes?: string[];
    hideOnScroll?: boolean;
  };
}

export interface NavItemConfig {
  label: string;
  href: string;
  external?: boolean;
}

export const defaultNavbarConfig: NavbarConfig = {
  /* sensible defaults — populated in Phase 2 */
} as NavbarConfig;

export const resolveNavbarConfig = createConfig(defaultNavbarConfig);
```

Every field the spec listed (theme, sticky/floating, desktop/mobile height, glass opacity, blur,
border radius, container width, shadow, spacing, accent color, logo, brand, navigation, profile,
CTA, mobile breakpoint, dock position, hideOnRoutes, animation, accessibility, responsive) has an
explicit home in this contract. Nothing is hardcoded inside `Navbar.tsx` in Phase 2 — the
component only ever reads from a resolved `NavbarConfig`.

### 4.4 Config authoring ergonomics for consumers
```ts
// consumer app — illustrative only
import { defineConfig } from "ishan-ui";

export const navbarConfig = defineConfig.navbar({
  appearance: { variant: "glass", accentColor: "#7C3AED" },
  layout: { position: "sticky" },
});
```
`defineConfig` gives consumers autocomplete and type-checking without needing to hand-import
each component's config type — mirroring the DX of `defineConfig` in Vite/Vitest/Astro.

---

## 5. Public API Design

```tsx
// Zero-config — every default applies
<Navbar />

// Fully config-driven — the only supported customization path
<Navbar config={navbarConfig} />

// Inline partial override (deep-merged over defaults at render time)
<Navbar config={{ appearance: { variant: "dark" } }} />

// Composition escape hatch for advanced consumers (Phase 2+, via parts/)
<Navbar config={navbarConfig}>
  <Navbar.Cta>Custom CTA content</Navbar.Cta>
</Navbar>
```

**API rules this locks in for every future component:**
1. A component always renders with zero required props (defaults must be production-usable).
2. The one blessed customization surface is `config`, never a long list of loose props —
   this is what keeps the prop surface stable as features grow (Open/Closed in practice).
3. Partial config objects are always valid; deep-merge against defaults happens internally.
4. Compound-component sub-parts (`Navbar.Cta`, future `Tabs.Panel`, `Accordion.Item`, etc.) are
   the only accepted way to inject custom children — never arbitrary prop-drilling.
5. `className` / `style` passthrough is reserved as an *additional*, optional low-level escape
   hatch, layered on top of config — not a replacement for it.

---

## 6. Build Strategy

### 6.1 Tooling
- **Vite Library Mode** as the build engine (`vite.config.ts`, `build.lib` entry).
- **vite-plugin-dts** to roll up `.d.ts` declarations into `dist/index.d.ts` (and per-entry
  declarations for deep imports).
- **CSS Modules** compiled and extracted to a single `dist/style.css`; consumers import it once
  or it's auto-linked depending on framework — decided per-consumer, not forced.

### 6.2 Output targets
| Format | File | Purpose |
|---|---|---|
| ESM | `dist/index.js` | modern bundlers, tree-shaking |
| CJS | `dist/index.cjs` | Node/legacy tooling compatibility |
| Types | `dist/index.d.ts` | full TypeScript support |
| CSS | `dist/style.css` | extracted component styles |

Multiple entry points are configured (root + one per component, e.g. `navbar`) so `dist/`
contains independently importable chunks — this is what makes `ishan-ui/navbar` deep imports and
root tree-shaking both work correctly.

### 6.3 `package.json` shape (illustrative)
```jsonc
{
  "name": "ishan-ui",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./navbar": {
      "types": "./dist/navbar/index.d.ts",
      "import": "./dist/navbar/index.js",
      "require": "./dist/navbar/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": ">=7.0.0"
  },
  "peerDependenciesMeta": {
    "react-router": { "optional": true }
  },
  "files": ["dist"]
}
```

Key decisions:
- **`react-router` is an optional peer dependency.** The library must render correctly with or
  without a router in the tree — `core/routing/useOptionalRouter.ts` detects context presence at
  runtime rather than importing router hooks unconditionally. This satisfies "React Router v7
  compatibility" without forcing it as a hard dependency for consumers who don't use routing.
- **`sideEffects: ["**/*.css"]`** preserves CSS emission under aggressive tree-shaking while
  still allowing bundlers to tree-shake unused JS component code.
- **`files: ["dist"]`** keeps `src/`, `docs/`, `examples/`, `tests/` out of the published tarball.

### 6.4 CI/build gates (`.github/workflows/ci.yml`)
Every PR runs, in order: typecheck (`tsc --noEmit` against `tsconfig.build.json`) → lint (with an
import-boundary rule enforcing §2's module boundaries) → unit tests → library build →
`scripts/verify-exports.mjs` (fails CI if `package.json#exports` drifts from actual `dist/`
output). This is what prevents "works on my machine" publishes.

### 6.5 Versioning & release
Changesets manages semver bumps and CHANGELOG generation per merged PR; `release.yml` publishes
to npm only after a changeset-driven version bump lands on `main`. Every future component
addition is a minor version; breaking config-shape changes are majors — enforced by review
convention, not tooling, since config shape isn't mechanically checkable for semver intent.

---

## Summary: what Phase 2 inherits for free
By the time Navbar implementation starts, it only needs to:
1. Fill in `defaultNavbarConfig` values.
2. Implement `Navbar.tsx` reading exclusively from a resolved `NavbarConfig`.
3. Build `parts/` sub-components.
4. Export from `components/Navbar/index.ts`.
5. Re-export from root `src/index.ts` and register the `ishan-ui/navbar` entry point.

No architecture, config engine, theming system, build config, or export strategy needs to be
invented at that point — it already exists and is identical for every component that follows.
