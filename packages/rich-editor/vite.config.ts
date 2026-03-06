import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.ts',
    'static-entry': 'src/static-entry.ts',
    'styles-entry': 'src/styles-entry.ts',
  },
})
