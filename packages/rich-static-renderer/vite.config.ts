import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  entry: {
    index: 'src/index.ts',
  },
})
