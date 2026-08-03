import { describe, expect, it } from "vitest";
import { defaultNavbarConfig, resolveNavbarConfig } from "../navbar.config";

describe("resolveNavbarConfig", () => {
  it("returns the library defaults when called with no overrides", () => {
    expect(resolveNavbarConfig()).toEqual(defaultNavbarConfig);
  });

  it("deep-merges a partial override without mutating the defaults", () => {
    const resolved = resolveNavbarConfig({
      appearance: { variant: "dark", accentColor: "#111111" },
    });

    expect(resolved.appearance.variant).toBe("dark");
    expect(resolved.appearance.accentColor).toBe("#111111");
    // Untouched sibling fields in the same group must survive the merge.
    expect(resolved.appearance.blur).toBe(defaultNavbarConfig.appearance.blur);
    expect(resolved.appearance.borderRadius).toBe(defaultNavbarConfig.appearance.borderRadius);
    // Original defaults object must remain untouched.
    expect(defaultNavbarConfig.appearance.variant).toBe("glass");
  });

  it("leaves unrelated top-level groups fully intact", () => {
    const resolved = resolveNavbarConfig({ layout: { position: "floating" } });
    expect(resolved.layout.position).toBe("floating");
    expect(resolved.mobile).toEqual(defaultNavbarConfig.mobile);
    expect(resolved.cta).toEqual(defaultNavbarConfig.cta);
  });

  it("replaces arrays wholesale rather than merging by index", () => {
    const resolved = resolveNavbarConfig({
      navigation: {
        items: [{ id: "home", label: "Home", path: "/" }],
      },
    });

    expect(resolved.navigation.items).toHaveLength(1);
    expect(resolved.navigation.items[0].id).toBe("home");
  });

  it("supports unlimited navigation items", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
      path: `/item-${i}`,
    }));

    const resolved = resolveNavbarConfig({ navigation: { items } });
    expect(resolved.navigation.items).toHaveLength(25);
  });
});
