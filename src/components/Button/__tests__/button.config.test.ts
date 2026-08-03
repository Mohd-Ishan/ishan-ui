import { describe, expect, it } from "vitest";
import { defaultButtonConfig, resolveButtonConfig } from "../button.config";

describe("resolveButtonConfig", () => {
  it("returns the library defaults when called with no overrides", () => {
    expect(resolveButtonConfig()).toEqual(defaultButtonConfig);
  });

  it("deep-merges a partial override without mutating the defaults", () => {
    const resolved = resolveButtonConfig({ variant: "outline", radius: 4 });
    expect(resolved.variant).toBe("outline");
    expect(resolved.radius).toBe(4);
    expect(resolved.size).toBe(defaultButtonConfig.size);
    expect(defaultButtonConfig.variant).toBe("solid");
  });

  it("deep-merges nested animation overrides", () => {
    const resolved = resolveButtonConfig({ animation: { duration: 0.3 } });
    expect(resolved.animation.duration).toBe(0.3);
    expect(resolved.animation.enabled).toBe(true);
  });
});
