import type { SerializedEditorState } from 'lexical'

import { doc, FORMAT_BOLD, FORMAT_ITALIC, paragraph, text } from './helpers'

export interface NodeSample {
  key: string
  label: string
  description: string
  category: 'inline' | 'block' | 'container'
  data: SerializedEditorState
}

export const nodeSamples: NodeSample[] = [
  // Inline Nodes
  {
    key: 'spoiler',
    label: 'Spoiler',
    description: '||spoiler|| syntax for hiding text',
    category: 'inline',
    data: doc(
      paragraph(
        text('This is a '),
        {
          type: 'spoiler',
          children: [text('hidden spoiler text')],
          version: 1,
        } as any,
        text(' that reveals on hover.'),
      ),
    ),
  },
  {
    key: 'katex-inline',
    label: 'KaTeX Inline',
    description: 'Inline math formula',
    category: 'inline',
    data: doc(
      paragraph(
        text("Einstein's famous equation is "),
        {
          type: 'katex-inline',
          equation: 'E = mc^2',
          version: 1,
        } as any,
        text(' which describes mass-energy equivalence.'),
      ),
    ),
  },
  {
    key: 'mention',
    label: 'Mention',
    description: 'Social media mention syntax',
    category: 'inline',
    data: doc(
      paragraph(
        text('Check out '),
        {
          type: 'mention',
          platform: 'GH',
          handle: 'innei',
          version: 1,
        } as any,
        text(' on GitHub and '),
        {
          type: 'mention',
          platform: 'TW',
          handle: '_oQuery',
          version: 1,
        } as any,
        text(' on Twitter.'),
      ),
    ),
  },
  {
    key: 'footnote',
    label: 'Footnote Reference',
    description: 'Footnote marker [^1]',
    category: 'inline',
    data: doc(
      paragraph(
        text('This is a statement with a footnote'),
        {
          type: 'footnote',
          identifier: '1',
          version: 1,
        } as any,
        text(' reference marker.'),
      ),
    ),
  },

  // Block Nodes
  {
    key: 'image',
    label: 'Image',
    description: 'Image with caption',
    category: 'block',
    data: doc({
      type: 'image',
      src: 'https://picsum.photos/800/400',
      altText: 'Beautiful landscape',
      caption: 'A stunning mountain landscape at sunset',
      version: 1,
    } as any),
  },
  {
    key: 'video',
    label: 'Video',
    description: 'Video embed',
    category: 'block',
    data: doc({
      type: 'video',
      src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      poster: 'https://picsum.photos/800/450',
      version: 1,
    } as any),
  },
  {
    key: 'codeblock',
    label: 'Code Block',
    description: 'Syntax-highlighted code block',
    category: 'block',
    data: doc({
      type: 'code-block',
      language: 'typescript',
      code: `function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))`,
      version: 1,
    } as any),
  },
  {
    key: 'katex-block',
    label: 'KaTeX Block',
    description: 'Block-level math formula',
    category: 'block',
    data: doc({
      type: 'katex-block',
      equation: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      version: 1,
    } as any),
  },
  {
    key: 'linkcard',
    label: 'Link Card',
    description: 'Rich link preview card',
    category: 'block',
    data: doc({
      type: 'link-card',
      url: 'https://github.com/Innei/Shiroi',
      title: 'Shiroi - Modern Blog System',
      description: 'A beautiful Next.js-based blog platform with rich features',
      favicon: 'https://github.githubassets.com/favicons/favicon.svg',
      image: 'https://opengraph.githubassets.com/1/Innei/Shiroi',
      version: 1,
    } as any),
  },
  {
    key: 'tasklist',
    label: 'Task List',
    description: 'Checkbox task list items',
    category: 'block',
    data: doc({
      type: 'list',
      listType: 'check',
      tag: 'ul',
      start: 1,
      children: [
        {
          type: 'task-listitem',
          checked: true,
          value: 1,
          children: [paragraph(text('Completed task'))],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
        {
          type: 'task-listitem',
          checked: false,
          value: 2,
          children: [paragraph(text('Pending task'))],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },

  // Container/Block Nodes with Alert Types
  {
    key: 'alert-note',
    label: 'Alert - Note',
    description: 'Note alert type',
    category: 'container',
    data: doc({
      type: 'alert-quote',
      alertType: 'note',
      children: [
        paragraph(
          text('This is a note alert. Use it for additional information.'),
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'alert-tip',
    label: 'Alert - Tip',
    description: 'Tip alert type',
    category: 'container',
    data: doc({
      type: 'alert-quote',
      alertType: 'tip',
      children: [
        paragraph(text('💡 Pro tip: Always test your code before deploying!')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'alert-important',
    label: 'Alert - Important',
    description: 'Important alert type',
    category: 'container',
    data: doc({
      type: 'alert-quote',
      alertType: 'important',
      children: [
        paragraph(text('⚠️ Important: This feature requires authentication.')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'alert-warning',
    label: 'Alert - Warning',
    description: 'Warning alert type',
    category: 'container',
    data: doc({
      type: 'alert-quote',
      alertType: 'warning',
      children: [
        paragraph(text('⚡ Warning: This operation cannot be undone!')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'alert-caution',
    label: 'Alert - Caution',
    description: 'Caution alert type',
    category: 'container',
    data: doc({
      type: 'alert-quote',
      alertType: 'caution',
      children: [
        paragraph(
          text(
            '🚨 Caution: Modifying this configuration may break your system.',
          ),
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },

  // Banner Types
  {
    key: 'banner-info',
    label: 'Banner - Info',
    description: 'Info banner',
    category: 'container',
    data: doc({
      type: 'banner',
      bannerType: 'info',
      children: [
        paragraph(
          text('ℹ️ New feature available! Check out our latest update.'),
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'banner-success',
    label: 'Banner - Success',
    description: 'Success banner',
    category: 'container',
    data: doc({
      type: 'banner',
      bannerType: 'success',
      children: [paragraph(text('✅ Operation completed successfully!'))],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'banner-warning',
    label: 'Banner - Warning',
    description: 'Warning banner',
    category: 'container',
    data: doc({
      type: 'banner',
      bannerType: 'warning',
      children: [
        paragraph(text('⚠️ Your trial period will expire in 7 days.')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'banner-error',
    label: 'Banner - Error',
    description: 'Error banner',
    category: 'container',
    data: doc({
      type: 'banner',
      bannerType: 'error',
      children: [
        paragraph(text('❌ Failed to save changes. Please try again.')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },

  // Advanced Containers
  {
    key: 'details',
    label: 'Details (Collapsible)',
    description: '<details> collapsible block',
    category: 'container',
    data: doc({
      type: 'details',
      summary: 'Click to expand',
      open: false,
      children: [
        paragraph(
          text('This content is hidden by default and can be toggled.'),
        ),
        paragraph(text('Perfect for FAQ sections or additional information.')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
  {
    key: 'tabs',
    label: 'Tabs',
    description: 'Multi-tab container',
    category: 'container',
    data: doc({
      type: 'tabs',
      tabs: [
        {
          label: 'JavaScript',
          content: 'console.log("Hello from JavaScript!")',
        },
        {
          label: 'TypeScript',
          content: 'const message: string = "Hello from TypeScript!"',
        },
        {
          label: 'Python',
          content: 'print("Hello from Python!")',
        },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'gallery-grid',
    label: 'Gallery - Grid',
    description: 'Image gallery with grid layout',
    category: 'container',
    data: doc({
      type: 'gallery',
      layout: 'grid',
      images: [
        { src: 'https://picsum.photos/400/300?random=1', alt: 'Image 1' },
        { src: 'https://picsum.photos/400/300?random=2', alt: 'Image 2' },
        { src: 'https://picsum.photos/400/300?random=3', alt: 'Image 3' },
        { src: 'https://picsum.photos/400/300?random=4', alt: 'Image 4' },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'gallery-carousel',
    label: 'Gallery - Carousel',
    description: 'Image gallery with carousel layout',
    category: 'container',
    data: doc({
      type: 'gallery',
      layout: 'carousel',
      images: [
        { src: 'https://picsum.photos/800/400?random=5', alt: 'Slide 1' },
        { src: 'https://picsum.photos/800/400?random=6', alt: 'Slide 2' },
        { src: 'https://picsum.photos/800/400?random=7', alt: 'Slide 3' },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'grid-container',
    label: 'Grid Container',
    description: '2-column grid layout',
    category: 'container',
    data: doc({
      type: 'grid-container',
      cols: 2,
      gap: 16,
      children: [
        paragraph(text('Left column content with some text', FORMAT_BOLD)),
        paragraph(
          text('Right column content with ', 0),
          text('italic text', FORMAT_ITALIC),
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any),
  },
]
