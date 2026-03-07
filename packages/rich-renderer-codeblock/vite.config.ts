import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    static: 'src/static.ts',
    shiki: 'src/shiki.ts',
    constants: 'src/constants.ts',
    icons: 'src/icons/index.ts',
  },
})
