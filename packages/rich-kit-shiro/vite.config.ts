import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  vanillaExtract: false,
  entry: {
    index: 'src/index.ts',
    editor: 'src/ShiroEditor.tsx',
    renderer: 'src/ShiroRenderer.tsx',
  },
})
