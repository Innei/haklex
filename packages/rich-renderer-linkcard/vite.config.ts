import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    static: 'src/static.ts',
  },
})
