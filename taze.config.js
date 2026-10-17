import { defineConfig } from 'taze';

export default defineConfig({
  // fetch latest package info from registry without cache
  force: true,
  // Keep checks read-only; pass --write --install to apply updates.
  write: false,
  install: false,
  // ignore paths for looking for package.json in monorepo
  ignorePaths: ['**/node_modules/**', '**/test/**'],
  // override with different bumping mode for each package
  packageMode: {
    typescript: 'major',
  },
  // disable checking for "overrides" package.json field
  depFields: {
    'overrides': false,
    'pnpm.overrides': false,
  },
  recursive: true,
  mode: 'latest',
});
