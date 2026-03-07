import { defineConfig } from '@lobehub/eslint-config';

export default defineConfig(
  {},
  {
    files: [
      'packages/rich-editor/src/plugins/MarkdownPastePlugin.tsx',
      'packages/rich-editor/src/transformers/alert.ts',
      'packages/rich-editor/src/transformers/container.ts',
      'packages/rich-editor/src/transformers/footnote.ts',
      'packages/rich-headless/src/transformers.ts',
      'packages/rich-renderer-linkcard/src/utils.ts',
    ],
    rules: {
      'unicorn/better-regex': 'off',
    },
  },
  {
    files: [
      'packages/rich-kit-shiro/bundle-test/*.mjs',
      'packages/rich-static-renderer/benchmark/run.tsx',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'packages/rich-ext-gallery/src/GalleryRenderer.tsx',
      'packages/rich-renderer-*/src/*Renderer.tsx',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['packages/rich-static-renderer/benchmark/run.tsx'],
    rules: {
      'prefer-regex-literals': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/optimal-quantifier-concatenation': 'off',
      'unicorn/better-regex': 'off',
    },
  },
);
