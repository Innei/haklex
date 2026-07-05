import path from 'node:path';
import { createRequire } from 'node:module';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const baseUiUtilsRoot = path.dirname(require.resolve('@base-ui/utils/package.json'));
const baseUiStoreIndex = path.join(baseUiUtilsRoot, 'store', 'index.mjs');
const baseUiStoreShimId = '\0haklex-base-ui-store';

const baseUiStoreModule = (file: string) =>
  JSON.stringify(path.join(baseUiUtilsRoot, 'store', file));

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    {
      name: 'haklex-base-ui-store-shim',
      enforce: 'pre',
      resolveId(id) {
        if (id === '@base-ui/utils/store' || id === baseUiStoreIndex) {
          return baseUiStoreShimId;
        }
        return null;
      },
      load(id) {
        if (id !== baseUiStoreShimId) return null;
        return [
          `export { createSelector } from ${baseUiStoreModule('createSelector.mjs')};`,
          `export { ReactStore } from ${baseUiStoreModule('ReactStore.mjs')};`,
          `export { Store } from ${baseUiStoreModule('Store.mjs')};`,
          `export { StoreInspector } from ${baseUiStoreModule('StoreInspector.mjs')};`,
          `export { useStore } from ${baseUiStoreModule('useStore.mjs')};`,
        ].join('\n');
      },
    },
    vanillaExtractPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: /^shiki$/,
        replacement: path.resolve(process.cwd(), 'src/cli/shiki-cdn.ts'),
      },
      {
        find: /^mermaid$/,
        replacement: path.resolve(process.cwd(), 'src/cli/mermaid-cdn.ts'),
      },
      {
        find: /^shiki\/bundle\/web$/,
        replacement: path.resolve(process.cwd(), 'src/cli/shiki-cdn.ts'),
      },
      {
        find: /^shiki\/engine\/javascript$/,
        replacement: path.resolve(process.cwd(), 'src/cli/shiki-engine-cdn.ts'),
      },
      {
        find: /^\.{1,2}\/components\/renderers\/KaTeXRenderer$/,
        replacement: path.resolve(process.cwd(), 'src/cli/katex-cdn-renderer.tsx'),
      },
    ],
  },
  build: {
    emptyOutDir: false,
    lib: {
      cssFileName: 'litexml-html-preview-client',
      entry: path.resolve(process.cwd(), 'src/cli/litexml-html-preview-client.tsx'),
      fileName: () => 'litexml-html-preview-client.js',
      formats: ['iife'],
      name: 'HaklexLiteXmlPreview',
    },
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: 'es2020',
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
});
