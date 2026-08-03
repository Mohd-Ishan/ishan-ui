# Modal

A self-contained, config-driven, accessible Modal component. No dependency
on any other component — copy this folder into another project or library
and it works as-is (only `react` / `react-dom` are required).

## Basic usage

```tsx
import { useState } from 'react';
import { Modal } from './Modal';

function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete project"
        subtitle="This action cannot be undone."
        footer={
          <>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button onClick={() => setOpen(false)}>Delete</button>
          </>
        }
      >
        Are you sure you want to delete this project and all of its data?
      </Modal>
    </>
  );
}
```

## Using a built-in preset

```tsx
<Modal isOpen={open} onClose={close} preset="glass" title="Upgrade plan">
  ...
</Modal>
```

Built-in presets: `default`, `minimal`, `modern`, `glass`, `apple`, `material`,
`dashboard`, `gaming`, `enterprise`.

## Custom config

`config` is deep-merged on top of the default config and the chosen preset,
so you only need to specify what you're changing:

```tsx
<Modal
  isOpen={open}
  onClose={close}
  preset="modern"
  config={{
    size: { width: 640 },
    radius: { token: 'pill' },
    position: 'top',
    animation: { type: 'slide', duration: 250 },
    theme: { accentColor: '#22c55e' },
  }}
>
  ...
</Modal>
```

## Responsive values

Any size or spacing field accepts either a plain value or a per-breakpoint
object:

```tsx
config={{
  size: { width: { base: '100%', md: 480, lg: 640 } },
  body: { padding: { base: 16, md: 24 } },
}}
```

Breakpoints (`sm`/`md`/`lg`/`xl`) default to `480/768/1024/1280` and can be
overridden via `config.responsive.breakpoints`.

## Registering your own presets

`resolveModalConfig` accepts a `presets` map, so a host library can supply
its own registry instead of (or in addition to) the built-in one:

```tsx
import { resolveModalConfig, modalPresets } from './resolveModalConfig';

const myPresets = { ...modalPresets, brand: { theme: { accentColor: '#ff5500' } } };
const config = resolveModalConfig({ preset: 'brand', presets: myPresets });
```

## Accessibility

- Renders with `role="dialog"` and `aria-modal="true"`.
- Traps Tab/Shift+Tab focus within the dialog while open.
- Closes on `Escape` (toggle via `closeOnEsc`).
- Restores focus to the previously-focused element on close, or to
  `finalFocusRef` if provided.
- Focuses the first focusable element on open, or `initialFocusRef` if
  provided.
- Locks body scroll while open (toggle via `lockScroll`).

## Folder contents

```
Modal/
├── Modal.tsx                Component: rendering, portal, focus, keyboard, animation
├── Modal.types.ts           All type definitions
├── modal.config.ts          defaultModalConfig + built-in presets
├── resolveModalConfig.ts    Deep merge + config -> CSS vars/data-attrs/responsive CSS
├── Modal.module.css         Styles, written against data-* attrs and CSS vars only
├── index.ts                 Public exports
└── __tests__/
    └── Modal.test.tsx
```

## Porting into another library

1. Copy the whole `Modal/` folder in.
2. If your library has its own preset registry format, either translate
   `modalPresets` into it, or just keep using `modalPresets` as-is by passing
   it explicitly to `resolveModalConfig({ presets: yourPresets })`.
3. If your library's build pipeline doesn't support CSS Modules, rename
   `Modal.module.css` to `Modal.css`, import it as a side effect, and change
   `styles.foo` references in `Modal.tsx` to plain string class names
   (e.g. `"modal-panel"`) — the CSS itself needs no changes since it's
   already keyed off class names and data-attributes, not CSS-module hashes.
