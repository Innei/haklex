import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  external: {
    startsWith: ['@base-ui/', 'motion', 'lucide-react'],
  },
})
