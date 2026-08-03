/**
 * src/types/global.d.ts
 *
 * Ambient module declarations. CSS Modules aren't real ES modules from
 * TypeScript's perspective, so every `import styles from "./X.module.css"`
 * needs this to type-check as `Record<string, string>`.
 */
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
