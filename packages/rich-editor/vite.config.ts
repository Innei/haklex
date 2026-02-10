import { resolve } from 'node:path'

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        editor: resolve(__dirname, 'src/editor.ts'),
        renderer: resolve(__dirname, 'src/renderer.ts'),
      },
      formats: ['es'],
      fileName: (_: string, entryName: string) => `${entryName}.mjs`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lexical',
        /^@lexical\//,
        'katex',
        /^shiki/,
        /^@radix-ui\//,
        /^motion/,
        /^lucide/,
      ],
      output: {
        preserveModules: false,
      },
    },
    cssCodeSplit: false,
    minify: false,
    target: 'es2020',
  },
})
