import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.ts',
    renderer: 'src/renderer.ts',
  },
  external: {
    include: ['lexical', 'katex'],
    startsWith: [
      '@lexical/',
      'shiki',
      '@shiro/rich-editor-ui',
      '@base-ui/',
      'motion',
      'lucide',
    ],
  },
})
