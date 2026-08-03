# Card Engine

A single, config-driven React component that can produce nearly any modern
card design — product, pricing, blog, dashboard, analytics, profile, team,
portfolio, feature, service, statistic, image, video, testimonial, gallery,
NFT, and game cards — without writing new CSS.

```bash
npm install framer-motion   # peer dependency
```

```tsx
import { Card, defineConfig } from './Card';

const config = defineConfig.card({
  preset: 'product',
  media: { src: '/shoe.png', alt: 'Running shoe' },
  header: { title: 'Air Runner X', subtitle: '$129.00' },
  footer: { buttons: <button>Add to cart</button> },
});

<Card config={config} />;
```

## How it works

Every visual property is driven by `config`, resolved through a three-layer
pipeline:

```
defaultCardConfig  →  preset (e.g. "glass")  →  your config
```

Layers are deep-merged without mutating any shared object
(`resolveCardConfig.ts`), so you only ever specify what's different from the
preset or default.

## Two ways to use it

**1. Fully config-driven** — no JSX composition required:

```tsx
<Card
  config={{
    preset: 'blog',
    media: { src: '/post.jpg' },
    header: { title: 'Shipping design systems at scale', subtitle: '8 min read' },
  }}
/>
```

**2. Composed with sub-components** — for full control over layout order and
custom content inside a section:

```tsx
<Card config={{ preset: 'pricing' }}>
  <Card.Header title="Pro plan" subtitle="$29/mo" />
  <Card.Body>
    <ul>
      <li>Unlimited projects</li>
      <li>Priority support</li>
    </ul>
  </Card.Body>
  <Card.Footer buttons={<button>Choose plan</button>} />
</Card>
```

Both styles read from the same resolved config, so tokens like typography,
radius, and hover behavior stay consistent either way.

## Built-in presets

`default` · `minimal` · `modern` · `glass` · `product` · `pricing` · `blog` ·
`dashboard` · `analytics` · `team` · `portfolio` · `gaming` · `enterprise` ·
`apple`

Custom presets are just a `PartialCardConfig` — spread the built-in table and
add your own:

```tsx
import { cardPresets, resolveCardConfig } from './Card';

const myPresets = { ...cardPresets, brand: { appearance: { variant: 'gradient' } } };
const config = resolveCardConfig({ ...myPresets.brand, header: { title: 'Custom' } });
```

## Examples

### Basic card

```tsx
<Card config={{ header: { title: 'Basic card' }, body: {} }}>
  <Card.Body>Plain content, default styling.</Card.Body>
</Card>
```

### Product card

```tsx
<Card
  config={{
    preset: 'product',
    media: { src: '/sneaker.jpg', alt: 'Sneaker', aspectRatio: '1 / 1' },
    header: { title: 'Nova Runner', subtitle: '$118.00' },
    badge: { content: 'Sale', position: 'top-left', background: '#ef4444' },
    footer: { buttons: <button>Add to bag</button> },
  }}
/>
```

### Blog card

```tsx
<Card
  config={{
    preset: 'blog',
    media: { src: '/cover.jpg', aspectRatio: '16 / 9' },
    header: {
      title: 'Designing for motion',
      description: 'How micro-interactions shape perceived performance.',
    },
    footer: { links: <a href="/post">Read more →</a> },
  }}
/>
```

### Pricing card

```tsx
<Card
  config={{
    preset: 'pricing',
    header: { title: 'Team', subtitle: '$79/mo' },
    body: {},
  }}
>
  <Card.Header title="Team" subtitle="$79/mo" align="center" />
  <Card.Body align="center">Up to 20 seats, SSO, audit logs.</Card.Body>
  <Card.Footer align="center" buttons={<button>Start trial</button>} />
</Card>
```

### Dashboard card

```tsx
<Card
  config={{
    preset: 'dashboard',
    header: { title: 'Server load' },
    body: {},
  }}
>
  <Card.Header title="Server load" />
  <Card.Body>62%</Card.Body>
</Card>
```

### Glass card

```tsx
<Card
  config={{
    preset: 'glass',
    header: { title: 'Frosted panel', description: 'Blurred translucent background.' },
  }}
/>
```

### Image card

```tsx
<Card
  config={{
    media: { src: '/landscape.jpg', position: 'top', fit: 'cover', aspectRatio: '4 / 3' },
  }}
/>
```

### Video card

```tsx
<Card
  config={{
    media: { type: 'video', src: '/clip.mp4', aspectRatio: '16 / 9' },
    header: { title: 'Behind the scenes' },
  }}
/>
```

### Profile / team card

```tsx
<Card
  config={{
    preset: 'team',
    media: { type: 'avatar', src: '/avatar.jpg', aspectRatio: '1 / 1', rounded: 'circle' },
    header: { title: 'Amara Diallo', subtitle: 'Design Lead' },
  }}
/>
```

### Feature card

```tsx
<Card
  config={{
    preset: 'minimal',
    header: { icon: <StarIcon />, title: 'Real-time sync', description: 'Changes propagate instantly.' },
  }}
/>
```

### Analytics card

```tsx
<Card config={{ preset: 'analytics', header: { title: 'Revenue' } }}>
  <Card.Header title="Revenue" />
  <Card.Body>$48,204</Card.Body>
</Card>
```

### Responsive card

```tsx
<Card
  config={{
    layout: {
      direction: { mobile: 'vertical', laptop: 'horizontal' },
      width: { mobile: '100%', desktop: '480px' },
    },
    header: {
      padding: { mobile: 'sm', desktop: 'lg' },
    },
  }}
/>
```

### Loading card

```tsx
<Card config={{ interaction: { loading: true }, loading: { kind: 'skeleton' } }} />
```

## Configuration reference

| Key | Purpose |
|---|---|
| `appearance` | Visual variant: solid, glass, transparent, outline, filled, gradient, soft, elevated |
| `layout` | Direction, gap, alignment, sizing — responsive-capable |
| `media` | Image / video / avatar / icon / svg / custom node, position, fit, aspect ratio |
| `header`, `body`, `footer` | Section content, padding, spacing, alignment, sticky, scrollable |
| `badge` | Positioned overlay badge, status/notification/custom |
| `actions` | Action row alignment and spacing |
| `background` | Solid, gradient, glass, image, overlay, blur |
| `border`, `radius`, `shadow` | Structural styling, token-based or custom |
| `hover` | Composable hover effects: lift, glow, scale, rotate, tilt, border-animation, shadow, background |
| `interaction` | Clickable, selectable, disabled, loading, and their handlers |
| `animation` | Framer Motion preset, duration, delay, easing, viewport trigger |
| `responsive` | Breakpoint thresholds used by every responsive field |
| `typography` | Independent type styles for title, subtitle, description, body, footer, badge |
| `theme` | Light/dark/custom mode plus arbitrary CSS variable overrides |
| `accessibility` | Role, aria labels, keyboard navigation, focus ring, reduced-motion behavior |

## Accessibility

- `interaction.clickable` / `selectable` cards are keyboard-reachable
  (`tabIndex`, Enter/Space activation) when `accessibility.keyboardNavigable`
  is true (default).
- `accessibility.focusRing` renders a visible `:focus-visible` ring.
- All animation and hover-transform effects are disabled under
  `prefers-reduced-motion: reduce` when `accessibility.respectReducedMotion`
  is true (default).
- Loading state sets `aria-busy`; the loading overlay uses `role="status"`.

## Implementation completeness

Every field in `Card.types.ts` now has a working effect — nothing is silently
ignored. A few fields were added in an additive way (existing keys were never
renamed or removed):

- `layout.minWidth`, `layout.maxWidth`, `layout.maxHeight`
- `background.position`, `background.size`, `background.repeat`, `background.attachment`
  — `background.image` / `background.video` render as a full-bleed layer
  behind all content, completely independent from `media`.
- `actions.direction` ('horizontal' | 'vertical'), `actions.wrap`
- `badge.icon`, `badge.rounded`
- `body.content` — lets config-only cards (no `<Card.Body>` composition)
  render body content directly from config.

Notable fixes:

- **Footer** now groups `buttons`/`links` on the leading edge and `actions`
  on the trailing edge, so `align: 'between'` separates the two *groups*
  instead of scattering individual buttons.
- **Radius** supports per-corner overrides (`topLeft`/`topRight`/`bottomLeft`/`bottomRight`)
  in addition to `all`.
- **Border** supports per-side width/color/style overrides.
- **Hover effects compose.** `lift`, `scale`, `rotate`, and `tilt` all
  animate `transform` and can't be layered as separate CSS rules without one
  overwriting another — these four are now combined into a single Framer
  Motion `whileHover` target. `glow`, `shadow`, `border-animation`, and
  `background` remain plain CSS since they touch different properties.
- **Responsive breakpoint resolution** had an off-by-one bucket bug (two
  width ranges both resolved to `'mobile'`) — fixed.
- **Typography** (`fontFamily`, `fontWeight`, `lineHeight`, `letterSpacing`,
  `color`, `textTransform`, `clamp`) is now fully applied per region, not
  just `fontSize`.
- **Reduced motion** is now tracked reactively via a `matchMedia` listener
  instead of being read once at mount.
- **Loading state** blocks pointer interaction on card content (not just
  visually dims) and sets `data-loading` for styling hooks.

## Notes

- Styling is implemented with CSS Modules + CSS variables (`Card.module.css`)
  — no inline magic numbers, no runtime CSS-in-JS.
- `resolveCardConfig` and `deepMerge` are pure functions safe to call outside
  React (e.g. to precompute config on the server).
- This folder has no dependency on any other component in the library and
  can be copied as-is into `ishan-ui`.
