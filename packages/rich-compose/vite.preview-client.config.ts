import path from 'node:path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [vanillaExtractPlugin()],
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
