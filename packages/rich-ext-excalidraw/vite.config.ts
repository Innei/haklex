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
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external: (id) =>
        [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@shiro/rich-editor',
          'lexical',
        ].includes(id) ||
        id.startsWith('tldraw') ||
        id.startsWith('@lexical/'),
      output: {
        preserveModules: false,
      },
    },
    cssCodeSplit: false,
    minify: false,
    target: 'es2020',
  },
})
