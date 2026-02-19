import { createViteConfig } from '../vite.shared'

export default createViteConfig({
  vanillaExtract: true,
  external: {
    include: [
      '@shiro/rich-editor',
      '@shiro/rich-renderer-codeblock',
      'lexical',
    ],
    startsWith: [
      '@lexical/',
      '@base-ui/',
      'lucide-react',
      '@shiro/rich-editor-ui',
      'shiki',
    ],
  },
})
