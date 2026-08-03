# Changesets

Every pull request that changes published behavior must include a changeset:

```bash
npx changeset
```

This prompts for a semver bump type (patch/minor/major) and a one-line summary,
then writes a markdown file here describing the change. `release.yml` picks
these up on merge to `main`, bumps `package.json#version`, updates
`CHANGELOG.md`, and publishes to npm — nothing is published manually.

See https://github.com/changesets/changesets for full docs.
