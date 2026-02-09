import type { SerializedEditorState } from 'lexical'

import {
  doc,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_ITALIC,
  heading,
  horizontalRule,
  link,
  list,
  listItem,
  paragraph,
  quote,
  text,
} from './helpers'

export interface Preset {
  key: string
  label: string
  description: string
  data: SerializedEditorState
}

export const presets: Preset[] = [
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
        version: 1,
      } as any,

      {
        type: 'alert-quote',
        alertType: 'note',
        children: [
          paragraph(
            text(
              "This guide assumes you have basic knowledge of JavaScript, React, and Node.js. If you're new to these technologies, check out our ",
            ),
            link(
              'https://beginners-guide.example.com',
              text("beginner's guide"),
            ),
            text(' first.'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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

      {
        type: 'alert-quote',
        alertType: 'tip',
        children: [
          paragraph(
            text('💡 Pro tip: Use '),
            text('pnpm', FORMAT_CODE),
            text(
              ' instead of npm for faster installs and better disk space efficiency. You can save up to 40% disk space!',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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

      {
        type: 'tabs',
        tabs: [
          {
            label: 'React',
            content:
              'React 19 with Server Components, Actions, and improved hydration',
          },
          {
            label: 'Next.js',
            content:
              'Next.js 15 with App Router, Turbopack, and partial prerendering',
          },
          {
            label: 'TypeScript',
            content: 'TypeScript 5.x with strict mode for type safety',
          },
          {
            label: 'Tailwind',
            content: 'Tailwind CSS v4 with modern CSS-first configuration',
          },
        ],
        version: 1,
      } as any,

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

      {
        type: 'alert-quote',
        alertType: 'important',
        children: [
          paragraph(
            text('⚠️ Important: Server Components cannot use hooks like '),
            text('useState', FORMAT_CODE),
            text(' or '),
            text('useEffect', FORMAT_CODE),
            text('. Mark client components with '),
            text('"use client"', FORMAT_CODE),
            text(' directive.'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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

      {
        type: 'alert-quote',
        alertType: 'warning',
        children: [
          paragraph(
            text(
              '⚡ Warning: Never expose API keys in client-side code! Always use environment variables and server-side validation.',
            ),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

      {
        type: 'alert-quote',
        alertType: 'caution',
        children: [
          paragraph(
            text(
              '🚨 Caution: XSS attacks are still prevalent. Always sanitize user input and use ',
            ),
            text('dangerouslySetInnerHTML', FORMAT_CODE),
            text(' sparingly.'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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
            type: 'task-listitem',
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
            type: 'task-listitem',
            checked: true,
            value: 2,
            children: [paragraph(text('Configure environment variables'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
            checked: true,
            value: 3,
            children: [paragraph(text('Enable compression and minification'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
            checked: false,
            value: 4,
            children: [paragraph(text('Set up monitoring with Sentry'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
            checked: false,
            value: 5,
            children: [paragraph(text('Implement analytics tracking'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
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
          },
          {
            src: 'https://picsum.photos/600/400?random=2',
            alt: 'Lighthouse score after optimization',
          },
          {
            src: 'https://picsum.photos/600/400?random=3',
            alt: 'Bundle size comparison',
          },
          {
            src: 'https://picsum.photos/600/400?random=4',
            alt: 'Load time metrics',
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
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        poster: 'https://picsum.photos/800/450?random=video',
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

      {
        type: 'alert-quote',
        alertType: 'note',
        children: [
          paragraph(
            text('This guide assumes familiarity with React and TypeScript.'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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

      {
        type: 'alert-quote',
        alertType: 'tip',
        children: [
          paragraph(
            text('Always call '),
            text('super(key)', FORMAT_CODE),
            text(' in your node constructor!'),
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } as any,

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
        type: 'tabs',
        tabs: [
          {
            label: 'Installation',
            content: 'npm install lexical @lexical/react',
          },
          {
            label: 'Basic Setup',
            content:
              'import { LexicalComposer } from "@lexical/react/LexicalComposer"',
          },
          {
            label: 'Configuration',
            content: 'const config = { namespace: "MyEditor", theme, nodes }',
          },
        ],
        version: 1,
      } as any,

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
            type: 'task-listitem',
            checked: true,
            value: 1,
            children: [paragraph(text('Install Lexical dependencies'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
            checked: true,
            value: 2,
            children: [paragraph(text('Set up basic editor'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
            checked: false,
            value: 3,
            children: [paragraph(text('Implement custom nodes'))],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'task-listitem',
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
        type: 'footnote',
        label: '1',
        version: 1,
      } as any,

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
