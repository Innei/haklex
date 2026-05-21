import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'react' },
  },
  test: {
    include: ['packages/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./packages/rich-litexml/tests/setup.ts'],
  },
});
