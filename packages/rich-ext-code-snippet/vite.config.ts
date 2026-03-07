import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  vanillaExtract: true,
  entry: {
    index: 'src/index.ts',
    static: 'src/static.ts',
  },
})
