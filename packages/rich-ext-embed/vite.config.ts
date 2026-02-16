import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
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
      external: (id: string) =>
        [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@shiro/rich-editor',
          'lexical',
        ].includes(id) ||
        id.startsWith('@lexical/') ||
        id.startsWith('@base-ui/') ||
        id.startsWith('lucide-react') ||
        id.startsWith('react-tweet') ||
        id.startsWith('shiki'),
      output: {
        preserveModules: false,
      },
    },
    cssCodeSplit: false,
    minify: false,
    target: 'es2020',
  },
})
