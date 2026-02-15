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
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        config: resolve(__dirname, 'src/config.ts'),
        'config-edit': resolve(__dirname, 'src/config-edit.ts'),
        alert: resolve(__dirname, 'src/alert.ts'),
        codeblock: resolve(__dirname, 'src/codeblock.ts'),
        gallery: resolve(__dirname, 'src/gallery.ts'),
        image: resolve(__dirname, 'src/image.ts'),
        linkcard: resolve(__dirname, 'src/linkcard.ts'),
        mention: resolve(__dirname, 'src/mention.ts'),
        mermaid: resolve(__dirname, 'src/mermaid.ts'),
        video: resolve(__dirname, 'src/video.ts'),
        tldraw: resolve(__dirname, 'src/tldraw.ts'),
        embed: resolve(__dirname, 'src/embed.ts'),
        'slash-menu': resolve(__dirname, 'src/slash-menu.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rollupOptions: {
      external: (id) =>
        [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@shiro/rich-editor',
        ].includes(id) ||
        id.startsWith('@shiro/rich-renderer-') ||
        id.startsWith('@shiro/rich-editor-') ||
        id.startsWith('@shiro/rich-plugin-') ||
        id.startsWith('@base-ui/') ||
        id.startsWith('lexical') ||
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
