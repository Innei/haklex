import { resolve } from 'node:path'

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const isLib = process.env.BUILD_LIB === '1'

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    ...(isLib
      ? [
          dts({
            entryRoot: 'src',
            outDir: 'dist',
            tsconfigPath: './tsconfig.json',
          }),
        ]
      : []),
  ],
  ...(isLib
    ? {
        build: {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'index.mjs',
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              '@shiro/rich-editor',
              'motion',
              'react-intersection-observer',
              '@emotion/is-prop-valid',
            ],
            output: {
              preserveModules: false,
            },
          },
          cssCodeSplit: false,
          minify: false,
          target: 'es2020',
        },
      }
    : {
        server: {
          port: 5188,
          open: true,
        },
        resolve: {
          dedupe: [
            'lexical',
            '@lexical/code',
            '@lexical/link',
            '@lexical/list',
            '@lexical/markdown',
            '@lexical/react',
            '@lexical/rich-text',
            '@lexical/table',
            'react',
            'react-dom',
          ],
        },
      }),
})
