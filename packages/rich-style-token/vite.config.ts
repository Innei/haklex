import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    styles: 'src/styles.ts',
  },
})
