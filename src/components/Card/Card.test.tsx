import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';
import { resolveCardConfig, deepMerge } from '../resolveCardConfig';
import { defaultCardConfig, cardPresets } from '../card.config';

describe('resolveCardConfig', () => {
  it('falls back to the default config when no user config is given', () => {
    const resolved = resolveCardConfig();
    expect(resolved.appearance?.variant).toBe('solid');
    expect(resolved.radius).toEqual({ all: 'md' });
  });

  it('layers preset config on top of the default config', () => {
    const resolved = resolveCardConfig({ preset: 'glass' });
    expect(resolved.appearance?.variant).toBe('glass');
    // Untouched fields still come from the default config
    expect(resolved.accessibility?.keyboardNavigable).toBe(true);
  });

  it('lets user config win over both default and preset', () => {
    const resolved = resolveCardConfig({ preset: 'glass', appearance: { variant: 'outline' } });
    expect(resolved.appearance?.variant).toBe('outline');
  });

  it('never mutates the default config or preset objects', () => {
    const defaultSnapshot = JSON.stringify(defaultCardConfig);
    const presetSnapshot = JSON.stringify(cardPresets.glass);

    resolveCardConfig({
      preset: 'glass',
      hover: { effects: ['glow'] },
      typography: { title: { fontSize: '3rem' } },
    });

    expect(JSON.stringify(defaultCardConfig)).toBe(defaultSnapshot);
    expect(JSON.stringify(cardPresets.glass)).toBe(presetSnapshot);
  });

  it('deep merges nested objects without dropping sibling keys', () => {
    const merged = deepMerge(
      { a: { x: 1, y: 2 }, b: 5 },
      { a: { y: 99 } },
    );
    expect(merged).toEqual({ a: { x: 1, y: 99 }, b: 5 });
  });

  it('replaces arrays wholesale rather than concatenating them', () => {
    const merged = deepMerge({ hover: { effects: ['lift'] } }, { hover: { effects: ['glow', 'scale'] } });
    expect(merged.hover.effects).toEqual(['glow', 'scale']);
  });
});

describe('<Card />', () => {
  it('renders title, subtitle, and description from config with no children', () => {
    render(
      <Card
        config={{
          header: {
            title: 'Nebula Pro',
            subtitle: 'Wireless headphones',
            description: 'Studio-grade sound, all day battery.',
          },
        }}
      />,
    );

    expect(screen.getByText('Nebula Pro')).toBeInTheDocument();
    expect(screen.getByText('Wireless headphones')).toBeInTheDocument();
    expect(screen.getByText('Studio-grade sound, all day battery.')).toBeInTheDocument();
  });

  it('renders compound sub-components when children are supplied', () => {
    render(
      <Card config={{ interaction: { clickable: true } }}>
        <Card.Header title="Composed Header" />
        <Card.Body>Composed body content</Card.Body>
        <Card.Footer buttons={<button type="button">Buy now</button>} />
      </Card>,
    );

    expect(screen.getByText('Composed Header')).toBeInTheDocument();
    expect(screen.getByText('Composed body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeInTheDocument();
  });

  it('fires onClick when clickable and not disabled', () => {
    const onClick = vi.fn();
    render(
      <Card config={{ interaction: { clickable: true, onClick } }}>
        <Card.Body>Click me</Card.Body>
      </Card>,
    );

    fireEvent.click(screen.getByText('Click me').closest('[data-clickable="true"]')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Card config={{ interaction: { clickable: true, disabled: true, onClick } }}>
        <Card.Body>Disabled card</Card.Body>
      </Card>,
    );

    fireEvent.click(screen.getByText('Disabled card').closest('[data-disabled="true"]')!);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('toggles selection state through onSelect', () => {
    const onSelect = vi.fn();
    render(
      <Card config={{ interaction: { selectable: true, selected: false, onSelect } }}>
        <Card.Body>Selectable</Card.Body>
      </Card>,
    );

    fireEvent.click(screen.getByText('Selectable').closest('[data-clickable], [aria-pressed]')!);
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it('renders a badge when badge.content is provided', () => {
    render(<Card config={{ badge: { content: 'New', position: 'top-left' } }} />);
    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-position', 'top-left');
  });

  it('shows the skeleton loading state when interaction.loading is true', () => {
    const { container } = render(
      <Card config={{ interaction: { loading: true }, loading: { kind: 'skeleton' } }}>
        <Card.Body>Content</Card.Body>
      </Card>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('applies aria-busy while loading', () => {
    render(
      <Card config={{ interaction: { loading: true }, accessibility: { ariaLabel: 'Product card' } }}>
        <Card.Body>Content</Card.Body>
      </Card>,
    );
    expect(screen.getByLabelText('Product card')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies the requested preset appearance variant', () => {
    render(
      <Card config={{ preset: 'glass', accessibility: { ariaLabel: 'Glass card' } }}>
        <Card.Body>Glass</Card.Body>
      </Card>,
    );
    expect(screen.getByLabelText('Glass card')).toHaveAttribute('data-appearance', 'glass');
  });

  it('groups footer buttons/links together, separate from actions', () => {
    render(
      <Card>
        <Card.Footer
          buttons={<button type="button">Buy</button>}
          links={<a href="#x">Details</a>}
          actions={<button type="button">Share</button>}
        />
      </Card>,
    );
    const buy = screen.getByRole('button', { name: 'Buy' });
    const details = screen.getByRole('link', { name: 'Details' });
    const share = screen.getByRole('button', { name: 'Share' });
    // buttons + links share one parent, actions sits in a separate group
    expect(buy.parentElement).toBe(details.parentElement);
    expect(share.parentElement).not.toBe(buy.parentElement);
  });

  it('resolves per-corner radius into a single border-radius shorthand', () => {
    render(
      <Card
        config={{
          radius: { topLeft: 'lg', topRight: 'lg', bottomLeft: 'none', bottomRight: 'none' },
          accessibility: { ariaLabel: 'Rounded top card' },
        }}
      />,
    );
    const card = screen.getByLabelText('Rounded top card');
    expect(card.style.getPropertyValue('--card-radius')).toContain('var(--card-radius-lg)');
  });

  it('renders an independent background image layer separate from media', () => {
    const { container } = render(
      <Card
        config={{
          background: { kind: 'image', image: 'https://example.com/bg.jpg', position: 'center', size: 'cover' },
          media: { src: 'https://example.com/media.jpg', alt: 'Media' },
        }}
      />,
    );
    // Both the background layer and the media <img> should be present independently.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getByAltText('Media')).toBeInTheDocument();
  });

  it('supports a vertical, wrapping actions row via the additive direction/wrap fields', () => {
    render(
      <Card>
        <Card.Actions
          direction="vertical"
          wrap
          items={
            <>
              <button type="button">One</button>
              <button type="button">Two</button>
            </>
          }
        />
      </Card>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    expect(one.parentElement).toHaveAttribute('data-direction', 'vertical');
    expect(one.parentElement).toHaveAttribute('data-wrap', 'true');
  });

  it('renders a badge icon alongside its content and a custom rounded value', () => {
    render(
      <Card
        config={{
          badge: { content: 'Live', icon: <span data-testid="badge-icon">●</span>, rounded: 'sm' },
        }}
      />,
    );
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
