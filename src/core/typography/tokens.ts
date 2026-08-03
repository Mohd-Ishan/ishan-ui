/**
 * core/typography/tokens.ts
 *
 * A per-section typography override shape. Originally declared inside
 * Navbar's own config file, moved here because it has zero Navbar-specific
 * meaning — font family/size/weight/letter-spacing/text-transform apply
 * identically to any component's text. Any component wanting the same
 * "override typography per visual section" pattern (Navbar's
 * logo/navigation/cta/dropdown/profile, or a future component's own
 * sections) imports this instead of declaring its own copy.
 */
export interface TypographyTokens {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
}
