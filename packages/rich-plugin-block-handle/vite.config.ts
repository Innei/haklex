import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  external: {
    include: ['@haklex/rich-editor-ui', 'lexical'],
    startsWith: ['@lexical/', 'lucide-react', '@base-ui/'],
  },
})
