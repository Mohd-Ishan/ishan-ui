# ADR 0001: Config objects, not prop sprawl, as the customization surface

## Status
Accepted (Phase 1).

## Context
UI libraries that expose customization through many individual props
(`stickyOffset`, `showShadow`, `shadowIntensity`, `mobileBreakpoint`, ...)
tend to accumulate an unmanageable, hard-to-version prop list as features
grow, and make "what's the default for X" hard to answer without reading
source.

## Decision
Every component accepts exactly one customization prop, `config`, typed as a
deep-partial of that component's own `<Name>Config` interface, resolved
against typed defaults via a shared `createConfig` factory
(`core/config/createConfig.ts`). No component may read a hardcoded visual or
behavioral value from anywhere other than its resolved config.

## Consequences
- **Positive:** the public prop surface never grows as features are added —
  only the config shape does, which is a much easier compatibility contract
  to reason about and version.
- **Positive:** `config` is always optional and partial; a zero-config
  component is guaranteed to render with production-usable defaults.
- **Trade-off:** deeply nested overrides require a slightly longer object
  path (`config.appearance.accentColor` vs. a flat `accentColor` prop). This
  is intentional — the grouping documents relationships between values (e.g.
  everything under `mobile` only applies below the mobile breakpoint).
- **Escape hatch:** for content injection that config objects can't express
  (arbitrary JSX), compound sub-components (e.g. `<Navbar.Cta>`) are the
  supported pattern — never ad hoc prop-drilling.
