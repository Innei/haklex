import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  vanillaExtract: false,
  entry: {
    index: 'src/index.ts',
    transformers: 'src/transformers.ts',
  },
})
