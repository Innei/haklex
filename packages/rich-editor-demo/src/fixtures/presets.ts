import type { SerializedEditorState } from 'lexical'

import {
  alertQuote,
  doc,
  footnote,
  footnoteSection,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_ITALIC,
  heading,
  horizontalRule,
  link,
  list,
  listItem,
  mention,
  paragraph,
  quote,
  text,
} from './helpers'
import { markdownTestPreset } from './markdown-test-preset'

export interface Preset {
  key: string
  label: string
  description: string
  data: SerializedEditorState
}

const notePreset: Preset = {
  key: 'note-diary',
  label: 'Note (Diary)',
  description:
    'Note variant showcase: serif font, drop cap, text-indent, accent blockquote',
  data: doc(
    paragraph(
      text(
        '今日立春，窗外柳枝初绿，微风携花香入室。晨起读书，偶得一句佳言，心中甚悦。遂记于此，以备日后回味。',
      ),
    ),

    paragraph(
      text(
        '午后独坐庭前，观云卷云舒。远山含黛，近水澄碧。忽闻邻家琴声悠扬，如泣如诉，令人不禁心生感慨。人生如梦，岁月如歌，唯有此刻的宁静最为珍贵。',
      ),
    ),

    quote(paragraph(text('山中何事？松花酿酒，春水煎茶。', FORMAT_ITALIC))),

    paragraph(
      text(
        '傍晚时分，与友人相约茶室。品茗论道，谈及近日所读之书，皆有所悟。友人言：「',
      ),
      text('读书不在多，而在于精', FORMAT_BOLD),
      text(
        '。」深以为然。一本好书，反复研读，每次皆有新得。此即所谓温故而知新也',
      ),
      footnote('1') as any,
      text('。'),
    ),

    paragraph(
      text(
        '夜深人静，灯下执笔。回顾一日所历，虽无惊天动地之事，却处处可见生活之美。窗外月色如水，虫鸣阵阵，正是读书写字的好时光。',
      ),
    ),

    paragraph(
      text('晚间在'),
      mention('GH', 'innei') as any,
      text('的项目里提了一个 issue，随后'),
      mention('TW', 'zhangsan') as any,
      text('在推特上回复了我。又在'),
      mention('TG', 'bookclub') as any,
      text('的读书群里分享了今日心得。'),
      mention('BB', '12345678') as any,
      text('的 up 主也发了同主题的视频，甚妙。'),
    ),

    horizontalRule(),

    heading('h2', text('读书札记')),

    paragraph(
      text('近日在读'),
      text('《浮生六记》', FORMAT_BOLD),
      text(
        '，沈复笔下的生活雅趣令人向往。书中所记，皆为日常琐事，然而字里行间流露出的真情实感，却能打动人心',
      ),
      footnote('2') as any,
      text('。'),
    ),

    alertQuote(
      'note',
      paragraph(text('生活之美，不在远方，而在身边。用心感受，方能体会。')),
    ) as any,

    paragraph(
      text(
        '记录生活，本身就是一种修行。不求辞藻华丽，但求真实自然。如此，方能留住时光中最美好的片段。',
      ),
    ),

    footnoteSection({
      '1': '《论语·为政》：「温故而知新，可以为师矣。」',
      '2': '沈复（1763—1825），清代文学家，著有《浮生六记》，记述其与妻陈芸的日常生活。',
    }) as any,
  ),
}

export const presets: Preset[] = [
  notePreset,
  markdownTestPreset,
  {
    key: 'tldraw-showcase',
    label: 'Tldraw Whiteboard',
    description:
      'Extension node demo: interactive tldraw canvas via extraNodes + children plugin',
    data: doc(
      heading('h1', text('Tldraw Whiteboard Extension')),

      paragraph(
        text('This preset demonstrates the '),
        text('@haklex/rich-ext-tldraw', FORMAT_CODE),
        text(
          ' extension package, which adds an interactive whiteboard node to the editor via the ',
        ),
        text('extraNodes', FORMAT_CODE),
        text(' + '),
        text('children', FORMAT_CODE),
        text(' plugin mechanism.'),
      ),

      alertQuote(
        'tip',
        paragraph(
          text(
            'The tldraw node is registered as an extension, not a built-in. It uses RichEditor children slot for the TldrawPlugin and extraNodes for node registration.',
          ),
        ),
      ) as any,

      heading('h2', text('Empty Canvas')),

      paragraph(
        text(
          'Below is an interactive tldraw canvas. In editor mode, you can draw, add shapes, and interact with it directly.',
        ),
      ),

      {
        type: 'tldraw',
        snapshot: '{}',
        version: 1,
      } as any,

      horizontalRule(),

      heading('h2', text('How It Works')),

      {
        type: 'code-block',
        language: 'tsx',
        code: `import { TldrawNode, TldrawPlugin } from '@haklex/rich-ext-tldraw'

// Editor: register node + plugin
<RichEditor extraNodes={[TldrawNode]}>
  <TldrawPlugin />
</RichEditor>

// Renderer: register node only
<RichRenderer extraNodes={[TldrawNode]} value={state} />`,
        version: 1,
      } as any,

      alertQuote(
        'note',
        paragraph(
          text(
            'The snapshot is stored as a JSON string in the Lexical state. The tldraw editor auto-persists changes back to the node.',
          ),
        ),
      ) as any,
    ),
  },
  {
    key: 'enhanced-renderers',
    label: 'Enhanced Renderers Showcase',
    description:
      'Demonstrates all standalone renderer packages: code, image, video, linkcard, gallery and mermaid',
    data: doc(
      heading('h1', text('Enhanced Renderers Demo')),

      paragraph(
        text(
          'This preset showcases the enhanced renderers from standalone packages: ',
        ),
        text('@haklex/rich-renderer-codeblock', FORMAT_CODE),
        text(', '),
        text('@haklex/rich-renderer-image', FORMAT_CODE),
        text(', '),
        text('@haklex/rich-renderer-video', FORMAT_CODE),
        text(', '),
        text('@haklex/rich-renderer-linkcard', FORMAT_CODE),
        text(', '),
        text('@haklex/rich-renderer-gallery', FORMAT_CODE),
        text(', and '),
        text('@haklex/rich-renderer-mermaid', FORMAT_CODE),
        text('.'),
      ),

      heading('h2', text('CodeBlock Renderer')),

      paragraph(
        text(
          'Migrated from web code-highlighter: language badge, copy action, Shiki highlight and long-code collapse.',
        ),
      ),

      {
        type: 'code-block',
        language: 'typescript',
        code: `interface FeedItem {
  id: string
  title: string
  createdAt: string
  tags: string[]
}

type FeedResponse = {
  data: FeedItem[]
  nextCursor?: string
}

async function fetchFeed(cursor?: string): Promise<FeedResponse> {
  const url = new URL('/api/feed', location.origin)
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(\`Feed request failed: \${response.status}\`)
  }

  return (await response.json()) as FeedResponse
}

async function bootstrapFeed() {
  const firstPage = await fetchFeed()
  console.log('Loaded items:', firstPage.data.length)
}`,
        version: 1,
      } as any,

      heading('h2', text('Image Renderer')),

      paragraph(
        text(
          'Migrated from web zoom-image: thumbhash placeholder, loading transition and click-to-zoom viewer.',
        ),
      ),

      {
        type: 'image',
        src: 'https://picsum.photos/1280/768?random=401',
        altText: 'enhanced image sample',
        caption: 'Enhanced image renderer with thumbhash placeholder + zoom',
        width: 1280,
        height: 768,
        thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        accent: '#7ba8c4',
        version: 1,
      } as any,

      heading('h2', text('Video Renderer')),

      paragraph(
        text(
          'Migrated from web VideoPlayer: click-to-play overlay, seek/volume controls, fullscreen and download.',
        ),
      ),

      {
        type: 'video',
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        poster: 'https://picsum.photos/1280/720?random=402',
        width: 1280,
        height: 720,
        version: 1,
      } as any,

      heading('h2', text('LinkCard with Plugin System')),

      paragraph(
        text(
          'The enhanced LinkCard renderer features a plugin system for dynamic fetching, spotlight hover effects, and platform-specific styling.',
        ),
      ),

      // GitHub repo LinkCard - uses plugin
      {
        type: 'link-card',
        url: 'https://github.com/facebook/react',
        title: 'facebook/react',
        description:
          'A JavaScript library for building user interfaces (fallback)',
        version: 1,
      } as any,

      paragraph(text('More LinkCard examples with different platforms:')),

      {
        type: 'link-card',
        url: 'https://example.com/article',
        title: 'Example Article Title',
        description:
          'This demonstrates the basic LinkCard renderer with static props.',
        favicon: 'https://example.com/favicon.ico',
        image: 'https://picsum.photos/400/200?random=linkcard1',
        version: 1,
      } as any,

      {
        type: 'link-card',
        url: 'https://another-example.com',
        title: 'Another Example with Image',
        description:
          'LinkCards support optional images and favicons for richer previews.',
        image: 'https://picsum.photos/400/200?random=linkcard2',
        version: 1,
      } as any,

      horizontalRule(),

      heading('h2', text('Gallery Renderer')),

      paragraph(
        text(
          'The enhanced Gallery renderer supports multiple layouts, carousel mode with autoplay, and photo zoom via ',
        ),
        text('react-photo-view', FORMAT_CODE),
        text('.'),
      ),

      heading('h3', text('Grid Layout')),

      {
        type: 'gallery',
        images: [
          {
            src: 'https://picsum.photos/400/300?random=1',
            alt: 'Gallery image 1',
            width: 400,
            height: 300,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/400/300?random=2',
            alt: 'Gallery image 2',
            width: 400,
            height: 300,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/400/300?random=3',
            alt: 'Gallery image 3',
            width: 400,
            height: 300,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/400/300?random=4',
            alt: 'Gallery image 4',
            width: 400,
            height: 300,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
        ],
        layout: 'grid',
        version: 1,
      } as any,

      heading('h3', text('Carousel Layout with Autoplay')),

      paragraph(
        text(
          'Carousel mode features bi-directional autoplay, navigation buttons, and smooth scrolling.',
        ),
      ),

      {
        type: 'gallery',
        images: [
          {
            src: 'https://picsum.photos/800/400?random=10',
            alt: 'Carousel image 1',
            width: 800,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/800/400?random=11',
            alt: 'Carousel image 2',
            width: 800,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/800/400?random=12',
            alt: 'Carousel image 3',
            width: 800,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/800/400?random=13',
            alt: 'Carousel image 4',
            width: 800,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/800/400?random=14',
            alt: 'Carousel image 5',
            width: 800,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
        ],
        layout: 'carousel',
        version: 1,
      } as any,

      heading('h3', text('Masonry Layout')),

      {
        type: 'gallery',
        images: [
          {
            src: 'https://picsum.photos/300/400?random=20',
            alt: 'Masonry 1',
            width: 300,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/300/500?random=21',
            alt: 'Masonry 2',
            width: 300,
            height: 500,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/300/300?random=22',
            alt: 'Masonry 3',
            width: 300,
            height: 300,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/300/450?random=23',
            alt: 'Masonry 4',
            width: 300,
            height: 450,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/300/350?random=24',
            alt: 'Masonry 5',
            width: 300,
            height: 350,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/300/400?random=25',
            alt: 'Masonry 6',
            width: 300,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
        ],
        layout: 'masonry',
        version: 1,
      } as any,

      heading('h2', text('Mermaid Renderer')),

      {
        type: 'mermaid',
        diagram: `flowchart LR
  A[Markdown AST] --> B[Lexical Nodes]
  B --> C[RendererConfig]
  C --> D[Standalone Renderer Packages]
  D --> E[Rich UX in Demo]`,
        version: 1,
      } as any,

      horizontalRule(),

      heading('h2', text('Features Summary')),

      list(
        'bullet',
        listItem(
          paragraph(
            text('CodeBlock: '),
            text('Language badge + copy + collapse', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Image: '),
            text('Blurhash placeholder + zoom viewer', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Video: '),
            text('Custom controls with seek/volume/fullscreen', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('LinkCard: '),
            text('Plugin system for dynamic fetching', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('LinkCard: '),
            text('Spotlight hover effects', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('LinkCard: '),
            text('Platform-specific styling', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Gallery: '),
            text('Carousel with bi-directional autoplay', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Gallery: '),
            text('Photo zoom lightbox', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Gallery: '),
            text('Grid, Masonry, Carousel layouts', FORMAT_BOLD),
          ),
        ),
        listItem(
          paragraph(
            text('Mermaid: '),
            text('Runtime diagram rendering with theme switch', FORMAT_BOLD),
          ),
        ),
      ),

      alertQuote(
        'tip',
        paragraph(text('Click on any gallery image to open the photo viewer!')),
      ) as any,
    ),
  },
  {
    key: 'comprehensive-article',
    label: 'Comprehensive Article',
    description:
      'Complete showcase featuring ALL node types in a realistic blog post',
    data: doc(
      heading('h1', text('Building Modern Web Applications: A Complete Guide')),

      paragraph(
        text(
          "In this comprehensive guide, we'll explore the cutting-edge techniques for building ",
        ),
        text('performant', FORMAT_BOLD),
        text(' and '),
        text('scalable', FORMAT_BOLD),
        text(' web applications in 2026. This article covers everything from '),
        text('React 19', FORMAT_CODE),
        text(' to advanced deployment strategies.'),
      ),

      {
        type: 'image',
        src: 'https://picsum.photos/1200/600?random=hero',
        altText: 'Modern web development workspace',
        caption:
          'A modern development environment with multiple monitors showing code',
        width: 1200,
        height: 600,
        thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        version: 1,
      } as any,

      alertQuote(
        'note',
        paragraph(
          text(
            "This guide assumes you have basic knowledge of JavaScript, React, and Node.js. If you're new to these technologies, check out our ",
          ),
          link('https://beginners-guide.example.com', text("beginner's guide")),
          text(' first.'),
        ),
      ) as any,

      heading('h2', text('Table of Contents')),

      list(
        'number',
        listItem(paragraph(text('Introduction to Modern Web Development'))),
        listItem(paragraph(text('Setting Up Your Development Environment'))),
        listItem(paragraph(text('Core Technologies and Frameworks'))),
        listItem(paragraph(text('Advanced Patterns and Best Practices'))),
        listItem(paragraph(text('Deployment and Performance Optimization'))),
      ),

      horizontalRule(),

      heading('h2', text('1. Introduction to Modern Web Development')),

      paragraph(
        text(
          "The web development landscape has evolved dramatically. Today's applications require a deep understanding of ",
        ),
        text('component-based architecture', FORMAT_BOLD),
        text(', '),
        text('state management', FORMAT_BOLD),
        text(', and '),
        text('server-side rendering', FORMAT_BOLD),
        text('.'),
      ),

      quote(
        paragraph(
          text(
            'The best code is no code at all. Every line of code you write is a liability.',
            FORMAT_ITALIC,
          ),
        ),
      ),

      paragraph(
        text('As '),
        {
          type: 'mention',
          platform: 'GH',
          handle: 'gaearon',
          version: 1,
        } as any,
        text(
          ' famously said, simplicity is key. This philosophy guides modern framework design.',
        ),
      ),

      heading('h2', text('2. Setting Up Your Development Environment')),

      alertQuote(
        'tip',
        paragraph(
          text('💡 Pro tip: Use '),
          text('pnpm', FORMAT_CODE),
          text(
            ' instead of npm for faster installs and better disk space efficiency. You can save up to 40% disk space!',
          ),
        ),
      ) as any,

      paragraph(
        text(
          "Here's a quick installation script for setting up a modern React project:",
        ),
      ),

      {
        type: 'code-block',
        language: 'bash',
        code: `# Install pnpm globally
npm install -g pnpm

# Create a new Next.js project
pnpm create next-app@latest my-app --typescript --tailwind --app

# Navigate to the project
cd my-app

# Install additional dependencies
pnpm add zustand @tanstack/react-query motion

# Start the development server
pnpm dev`,
        version: 1,
      } as any,

      heading('h3', text('Project Structure')),

      paragraph(text('The architecture can be visualized as follows:')),

      {
        type: 'mermaid',
        diagram: `graph LR
    A[Client] --> B[Next.js App]
    B --> C[API Routes]
    C --> D[Database]
    B --> E[Static Assets]
    B --> F[Edge Runtime]`,
        version: 1,
      } as any,

      {
        type: 'grid-container',
        cols: 2,
        gap: 20,
        children: [
          paragraph(
            text('Frontend Architecture', FORMAT_BOLD),
            { type: 'linebreak', version: 1 } as any,
            text(
              'Components organized by feature, not by type. Co-locate styles, tests, and logic.',
            ),
          ),
          paragraph(
            text('Backend Services', FORMAT_BOLD),
            { type: 'linebreak', version: 1 } as any,
            text(
              'API routes following REST principles, with proper error handling and validation.',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h2', text('3. Core Technologies and Frameworks')),

      heading('h3', text('React Server Components')),

      paragraph(
        text(
          'React Server Components (RSC) revolutionize how we build applications. They allow us to fetch data directly in components without client-side overhead',
        ),
        {
          type: 'footnote',
          identifier: '1',
          version: 1,
        } as any,
        text('.'),
      ),

      {
        type: 'code-block',
        language: 'typescript',
        code: `// app/posts/page.tsx
export default async function PostsPage() {
  // This runs on the server only!
  const posts = await db.posts.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}`,
        version: 1,
      } as any,

      alertQuote(
        'important',
        paragraph(
          text('⚠️ Important: Server Components cannot use hooks like '),
          text('useState', FORMAT_CODE),
          text(' or '),
          text('useEffect', FORMAT_CODE),
          text('. Mark client components with '),
          text('"use client"', FORMAT_CODE),
          text(' directive.'),
        ),
      ) as any,

      heading('h3', text('State Management Patterns')),

      paragraph(
        text('Modern applications benefit from '),
        text('atomic state management', FORMAT_BOLD),
        text(". Here's a comparison of popular solutions:"),
      ),

      {
        type: 'details',
        summary: 'Compare Zustand vs Jotai vs Redux Toolkit',
        open: false,
        children: [
          list(
            'bullet',
            listItem(
              paragraph(
                text('Zustand', FORMAT_BOLD),
                text(' - Minimal boilerplate, great DX, 1.2KB gzipped'),
              ),
            ),
            listItem(
              paragraph(
                text('Jotai', FORMAT_BOLD),
                text(
                  ' - Atomic approach, perfect for derived state, 3KB gzipped',
                ),
              ),
            ),
            listItem(
              paragraph(
                text('Redux Toolkit', FORMAT_BOLD),
                text(
                  ' - Battle-tested, excellent DevTools, but heavier at 12KB',
                ),
              ),
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h2', text('4. Advanced Patterns and Best Practices')),

      heading('h3', text('Mathematical Optimization')),

      paragraph(
        text(
          'When optimizing rendering performance, we often need to calculate the ',
        ),
        text('time complexity', FORMAT_BOLD),
        text('. The optimal algorithm has a complexity of '),
        {
          type: 'katex-inline',
          equation: 'O(n \\log n)',
          version: 1,
        } as any,
        text(' compared to the naive '),
        {
          type: 'katex-inline',
          equation: 'O(n^2)',
          version: 1,
        } as any,
        text(' approach.'),
      ),

      paragraph(text('The performance improvement can be modeled as:')),

      {
        type: 'katex-block',
        equation:
          '\\text{Speedup} = \\frac{T_{\\text{old}}}{T_{\\text{new}}} = \\frac{n^2}{n \\log n} \\approx \\frac{n}{\\log n}',
        version: 1,
      } as any,

      heading('h3', text('Spoiler: Advanced Technique')),

      paragraph(
        text("There's a little-known optimization technique: "),
        {
          type: 'spoiler',
          children: [
            text(
              'Use React.memo() with custom comparison function to prevent unnecessary re-renders in deeply nested component trees',
            ),
          ],
          version: 1,
        } as any,
        text('. This can dramatically improve performance in complex UIs.'),
      ),

      heading('h3', text('Security Considerations')),

      alertQuote(
        'warning',
        paragraph(
          text(
            '⚡ Warning: Never expose API keys in client-side code! Always use environment variables and server-side validation.',
          ),
        ),
      ) as any,

      alertQuote(
        'caution',
        paragraph(
          text(
            '🚨 Caution: XSS attacks are still prevalent. Always sanitize user input and use ',
          ),
          text('dangerouslySetInnerHTML', FORMAT_CODE),
          text(' sparingly.'),
        ),
      ) as any,

      heading('h2', text('5. Deployment and Performance')),

      {
        type: 'banner',
        bannerType: 'info',
        children: [
          paragraph(
            text(
              'ℹ️ New Feature: Edge Runtime support is now available in Next.js 15, enabling millisecond response times globally!',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h3', text('Deployment Checklist')),

      {
        type: 'list',
        listType: 'check',
        tag: 'ul',
        start: 1,
        children: [
          {
            type: 'listitem',
            checked: true,
            value: 1,
            children: [
              paragraph(text('Set up CI/CD pipeline with GitHub Actions')),
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: true,
            value: 2,
            children: [paragraph(text('Configure environment variables'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: true,
            value: 3,
            children: [paragraph(text('Enable compression and minification'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: false,
            value: 4,
            children: [paragraph(text('Set up monitoring with Sentry'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: false,
            value: 5,
            children: [paragraph(text('Implement analytics tracking'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: false,
            value: 6,
            children: [paragraph(text('Configure CDN and edge caching'))],
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
      } as any,

      heading('h3', text('Performance Metrics')),

      paragraph(
        text(
          "Here's a real-world performance comparison from our production deployment:",
        ),
      ),

      {
        type: 'gallery',
        layout: 'grid',
        images: [
          {
            src: 'https://picsum.photos/600/400?random=1',
            alt: 'Lighthouse score before optimization',
            width: 600,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/600/400?random=2',
            alt: 'Lighthouse score after optimization',
            width: 600,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/600/400?random=3',
            alt: 'Bundle size comparison',
            width: 600,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
          {
            src: 'https://picsum.photos/600/400?random=4',
            alt: 'Load time metrics',
            width: 600,
            height: 400,
            thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          },
        ],
        version: 1,
      } as any,

      {
        type: 'banner',
        bannerType: 'success',
        children: [
          paragraph(
            text(
              '✅ Results: We achieved a 60% reduction in bundle size and 45% faster Time to Interactive!',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h2', text('Video Tutorial')),

      paragraph(
        text('Watch this comprehensive walkthrough of the deployment process:'),
      ),

      {
        type: 'video',
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        poster: 'https://picsum.photos/800/450?random=video',
        width: 1280,
        height: 720,
        version: 1,
      } as any,

      paragraph(
        text(
          'Complete deployment workflow tutorial (25 minutes)',
          FORMAT_ITALIC,
        ),
      ),

      heading('h2', text('Additional Resources')),

      paragraph(
        text(
          'For more in-depth coverage, check out these excellent resources:',
        ),
      ),

      {
        type: 'link-card',
        url: 'https://react.dev',
        title: 'React Documentation',
        description:
          'The official React documentation with comprehensive guides and API reference',
        favicon: 'https://react.dev/favicon.ico',
        image: 'https://react.dev/images/og-home.png',
        version: 1,
      } as any,

      {
        type: 'link-card',
        url: 'https://nextjs.org',
        title: 'Next.js by Vercel',
        description:
          "The React Framework for the Web. Used by some of the world's largest companies",
        favicon: 'https://nextjs.org/favicon.ico',
        image: 'https://nextjs.org/og.png',
        version: 1,
      } as any,

      horizontalRule(),

      heading('h2', text('Conclusion')),

      paragraph(
        text(
          'Building modern web applications requires mastering a complex ecosystem. But with the right tools and patterns, you can create ',
        ),
        text('fast', FORMAT_BOLD),
        text(', '),
        text('reliable', FORMAT_BOLD),
        text(', and '),
        text('maintainable', FORMAT_BOLD),
        text(' applications.'),
      ),

      {
        type: 'banner',
        bannerType: 'warning',
        children: [
          paragraph(
            text(
              '⚠️ Remember: Premature optimization is the root of all evil. Always measure before optimizing!',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      paragraph(
        text('Special thanks to '),
        {
          type: 'mention',
          platform: 'GH',
          handle: 'vercel',
          version: 1,
        } as any,
        text(' and '),
        {
          type: 'mention',
          platform: 'TW',
          handle: 'reactjs',
          version: 1,
        } as any,
        text(' for their incredible contributions to the ecosystem.'),
      ),

      horizontalRule(),

      paragraph(
        text(
          'Published: January 2026 | Reading time: 15 minutes',
          FORMAT_ITALIC,
        ),
      ),
    ),
  },

  {
    key: 'tech-article',
    label: 'Technical Article',
    description:
      'Comprehensive technical article with code, math, alerts, and advanced features',
    data: doc(
      heading('h1', text('Building a Lexical Editor: A Complete Guide')),

      paragraph(
        text(
          "Lexical is Facebook's modern text editor framework. In this guide, we'll explore how to build a feature-rich editor with custom nodes.",
        ),
      ),

      alertQuote(
        'note',
        paragraph(
          text('This guide assumes familiarity with React and TypeScript.'),
        ),
      ) as any,

      heading('h2', text('Core Concepts')),

      paragraph(text('Lexical operates on three core concepts:')),

      {
        type: 'grid-container',
        cols: 2,
        gap: 16,
        children: [
          paragraph(
            text('Editor State', FORMAT_BOLD),
            { type: 'linebreak', version: 1 } as any,
            text('Immutable snapshot of your editor content'),
          ),
          paragraph(
            text('Nodes', FORMAT_BOLD),
            { type: 'linebreak', version: 1 } as any,
            text('Atomic units representing content'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h2', text('Creating Custom Nodes')),

      paragraph(text("Here's how to create a custom node:")),

      {
        type: 'code-block',
        language: 'typescript',
        code: `export class CustomNode extends DecoratorNode<ReactElement> {
  static getType(): string {
    return 'custom'
  }

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  decorate(): ReactElement {
    return <CustomRenderer />
  }
}`,
        version: 1,
      } as any,

      alertQuote(
        'tip',
        paragraph(
          text('Always call '),
          text('super(key)', FORMAT_CODE),
          text(' in your node constructor!'),
        ),
      ) as any,

      heading('h2', text('Mathematical Expressions')),

      paragraph(
        text(
          'Lexical can render beautiful math equations. The quadratic formula ',
        ),
        {
          type: 'katex-inline',
          equation: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          version: 1,
        } as any,
        text(' is rendered inline.'),
      ),

      paragraph(text('Block equations look like this:')),

      {
        type: 'katex-block',
        equation: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
        version: 1,
      } as any,

      heading('h2', text('Advanced Features')),

      {
        type: 'details',
        summary: 'Common Pitfalls and Solutions',
        open: false,
        children: [
          list(
            'number',
            listItem(
              paragraph(text('Forgetting to register custom nodes in config')),
            ),
            listItem(paragraph(text('Not stabilizing onEditorReady callback'))),
            listItem(paragraph(text('Mutating editor state outside updates'))),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      heading('h2', text('Task Checklist')),

      {
        type: 'list',
        listType: 'check',
        tag: 'ul',
        start: 1,
        children: [
          {
            type: 'listitem',
            checked: true,
            value: 1,
            children: [paragraph(text('Install Lexical dependencies'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: true,
            value: 2,
            children: [paragraph(text('Set up basic editor'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: false,
            value: 3,
            children: [paragraph(text('Implement custom nodes'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'listitem',
            checked: false,
            value: 4,
            children: [paragraph(text('Add plugins and transformers'))],
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
      } as any,

      horizontalRule(),

      paragraph(
        text('Special thanks to '),
        {
          type: 'mention',
          platform: 'GH',
          handle: 'facebook',
          version: 1,
        } as any,
        text(' for creating Lexical!'),
      ),

      {
        type: 'link-card',
        url: 'https://lexical.dev',
        title: 'Lexical - An extensible text editor framework',
        description:
          'Lexical is an extensible JavaScript web text-editor framework with an emphasis on reliability, accessibility, and performance.',
        favicon: 'https://lexical.dev/favicon.ico',
        version: 1,
      } as any,
    ),
  },
]
