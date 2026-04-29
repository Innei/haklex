import type { SerializedEditorState } from 'lexical';

import {
  alertQuote,
  chat,
  doc,
  FORMAT_BOLD,
  FORMAT_ITALIC,
  paragraph,
  poll,
  ruby,
  table,
  tableCell,
  tableRow,
  text,
} from './helpers';

export interface NodeSample {
  category: 'inline' | 'block' | 'container';
  data: SerializedEditorState;
  description: string;
  key: string;
  label: string;
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
    key: 'ruby',
    label: 'Ruby Annotation',
    description: 'Japanese furigana annotation with base text + reading',
    category: 'inline',
    data: doc(
      paragraph(
        text('日文注音示例：'),
        ruby('漢字', 'かんじ'),
        text(' 与 '),
        ruby('東京', 'とうきょう'),
        text('。'),
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
    key: 'comment',
    label: 'HTML Comment',
    description: 'Editable in editor mode and rendered as an actual HTML comment in readonly mode',
    category: 'inline',
    data: doc(
      paragraph(
        text('Visible before'),
        text(' '),
        {
          type: 'comment',
          text: 'draft-note: hidden in static renderer output',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
          version: 1,
        } as any,
        text(' '),
        text('visible after.'),
      ),
    ),
  },
  {
    key: 'footnote',
    label: 'Footnote Reference',
    description: 'Footnote marker [^1] with definitions section',
    category: 'inline',
    data: doc(
      paragraph(
        text('This is a statement with a footnote'),
        {
          type: 'footnote',
          identifier: '1',
          version: 1,
        } as any,
        text(' and another reference'),
        {
          type: 'footnote',
          identifier: '2',
          version: 1,
        } as any,
        text('.'),
      ),
      {
        type: 'footnote-section',
        definitions: {
          '1': 'First footnote with detailed explanation.',
          '2': 'Second footnote referencing additional sources.',
        },
        version: 1,
      } as any,
    ),
  },

  // Block Nodes
  {
    key: 'image',
    label: 'Image',
    description: 'Image with thumbhash placeholder and zoom viewer',
    category: 'block',
    data: doc({
      type: 'image',
      src: 'https://picsum.photos/1200/720?random=301',
      altText: 'Beautiful landscape',
      caption: 'A stunning mountain landscape with loading placeholder',
      width: 1200,
      height: 720,
      thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      accent: '#7ba8c4',
      version: 1,
    } as any),
  },
  {
    key: 'video',
    label: 'Video',
    description: 'Custom player with seek, volume, fullscreen and download',
    category: 'block',
    data: doc({
      type: 'video',
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://picsum.photos/1280/720?random=302',
      width: 1280,
      height: 720,
      version: 1,
    } as any),
  },
  {
    key: 'codeblock',
    label: 'Code Block',
    description: 'Code card with language badge, copy button and collapse',
    category: 'block',
    data: doc({
      type: 'code-block',
      language: 'typescript',
      code: `type User = {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

type ApiResult<T> = {
  data: T
  status: number
}

function assertOk<T>(result: ApiResult<T>): T {
  if (result.status >= 400) {
    throw new Error(\`Request failed: \${result.status}\`)
  }
  return result.data
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  const result = (await response.json()) as ApiResult<User[]>
  return assertOk(result)
}

async function bootstrap() {
  const users = await fetchUsers()
  const visible = users.filter((user) => user.role !== 'viewer')
  console.table(visible)
}

void bootstrap()`,
      version: 1,
    } as any),
  },
  {
    key: 'code-snippet',
    label: 'Code Snippet',
    description: 'Multi-file code snippet with tabbed file display',
    category: 'block',
    data: doc({
      type: 'code-snippet',
      files: [
        {
          filename: 'index.ts',
          code: `export function hello(name: string): string {\n  return \`Hello, \${name}!\`\n}`,
          language: 'typescript',
        },
        {
          filename: 'test.ts',
          code: `import { hello } from './index'\n\nconsole.log(hello('World'))`,
          language: 'typescript',
        },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'mermaid',
    label: 'Mermaid Diagram',
    description: 'Independent Mermaid diagram node',
    category: 'block',
    data: doc({
      type: 'mermaid',
      diagram: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
    C --> E[End]
    D --> E`,
      version: 1,
    } as any),
  },
  {
    key: 'mermaid-sequence',
    label: 'Mermaid - Sequence Diagram',
    description: 'Sequence diagram showing interactions',
    category: 'block',
    data: doc({
      type: 'mermaid',
      diagram: `sequenceDiagram
    participant Client
    participant Server
    participant DB
    Client->>Server: POST /api/login
    Server->>DB: Query user
    DB-->>Server: User record
    Server-->>Client: JWT token`,
      version: 1,
    } as any),
  },
  {
    key: 'mermaid-pie',
    label: 'Mermaid - Pie Chart',
    description: 'Pie chart for data visualization',
    category: 'block',
    data: doc({
      type: 'mermaid',
      diagram: `pie title Tech Stack Usage
    "React" : 45
    "Vue" : 25
    "Angular" : 15
    "Svelte" : 10
    "Other" : 5`,
      version: 1,
    } as any),
  },
  {
    key: 'mermaid-classDiagram',
    label: 'Mermaid - Class Diagram',
    description: 'UML class diagram',
    category: 'block',
    data: doc({
      type: 'mermaid',
      diagram: `classDiagram
    class Node {
      +String type
      +getType() String
      +clone() Node
    }
    class DecoratorNode {
      +decorate() ReactElement
    }
    class MermaidNode {
      -String diagram
      +getDiagram() String
    }
    Node <|-- DecoratorNode
    DecoratorNode <|-- MermaidNode`,
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
    key: 'table',
    label: 'Table',
    description: 'Table with header row, action menu, hover add, and column resize',
    category: 'block',
    data: doc(
      table(
        tableRow(
          tableCell(1, paragraph(text('Feature'))),
          tableCell(1, paragraph(text('Status'))),
          tableCell(1, paragraph(text('Notes'))),
        ),
        tableRow(
          tableCell(0, paragraph(text('Action Menu'))),
          tableCell(0, paragraph(text('Done', FORMAT_BOLD))),
          tableCell(0, paragraph(text('Chevron dropdown on active cell'))),
        ),
        tableRow(
          tableCell(0, paragraph(text('Hover Actions'))),
          tableCell(0, paragraph(text('Done', FORMAT_BOLD))),
          tableCell(0, paragraph(text('+ buttons on edges'))),
        ),
        tableRow(
          tableCell(0, paragraph(text('Column Resize'))),
          tableCell(0, paragraph(text('Done', FORMAT_BOLD))),
          tableCell(0, paragraph(text('Drag cell borders'))),
        ),
      ) as any,
    ),
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
          type: 'listitem',
          checked: true,
          value: 1,
          children: [paragraph(text('Completed task'))],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
        {
          type: 'listitem',
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
    data: doc(
      alertQuote(
        'note',
        paragraph(text('This is a note alert. Use it for additional information.')),
      ) as any,
    ),
  },
  {
    key: 'alert-tip',
    label: 'Alert - Tip',
    description: 'Tip alert type',
    category: 'container',
    data: doc(
      alertQuote(
        'tip',
        paragraph(text('💡 Pro tip: Always test your code before deploying!')),
      ) as any,
    ),
  },
  {
    key: 'alert-important',
    label: 'Alert - Important',
    description: 'Important alert type',
    category: 'container',
    data: doc(
      alertQuote(
        'important',
        paragraph(text('⚠️ Important: This feature requires authentication.')),
      ) as any,
    ),
  },
  {
    key: 'alert-warning',
    label: 'Alert - Warning',
    description: 'Warning alert type',
    category: 'container',
    data: doc(
      alertQuote('warning', paragraph(text('⚡ Warning: This operation cannot be undone!'))) as any,
    ),
  },
  {
    key: 'alert-caution',
    label: 'Alert - Caution',
    description: 'Caution alert type',
    category: 'container',
    data: doc(
      alertQuote(
        'caution',
        paragraph(text('🚨 Caution: Modifying this configuration may break your system.')),
      ) as any,
    ),
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
      children: [paragraph(text('ℹ️ New feature available! Check out our latest update.'))],
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
      children: [paragraph(text('⚠️ Your trial period will expire in 7 days.'))],
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
      children: [paragraph(text('❌ Failed to save changes. Please try again.'))],
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
        paragraph(text('This content is hidden by default and can be toggled.')),
        paragraph(text('Perfect for FAQ sections or additional information.')),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
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
        {
          src: 'https://picsum.photos/400/300?random=1',
          alt: 'Image 1',
          width: 400,
          height: 300,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: 'https://picsum.photos/400/300?random=2',
          alt: 'Image 2',
          width: 400,
          height: 300,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: 'https://picsum.photos/400/300?random=3',
          alt: 'Image 3',
          width: 400,
          height: 300,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: 'https://picsum.photos/400/300?random=4',
          alt: 'Image 4',
          width: 400,
          height: 300,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
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
        {
          src: 'https://picsum.photos/800/400?random=5',
          alt: 'Slide 1',
          width: 800,
          height: 400,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: 'https://picsum.photos/800/400?random=6',
          alt: 'Slide 2',
          width: 800,
          height: 400,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
        {
          src: 'https://picsum.photos/800/400?random=7',
          alt: 'Slide 3',
          width: 800,
          height: 400,
          thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'excalidraw',
    label: 'Excalidraw Canvas',
    description: 'Interactive excalidraw whiteboard (extension node via extraNodes)',
    category: 'block',
    data: doc({
      type: 'excalidraw',
      snapshot: JSON.stringify({
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 200,
            height: 120,
            strokeColor: '#1971c2',
            backgroundColor: '#a5d8ff',
            fillStyle: 'solid',
            strokeWidth: 2,
            roughness: 1,
            opacity: 100,
            seed: 1,
            version: 1,
            versionNonce: 1,
            isDeleted: false,
            boundElements: null,
            updated: 1,
            link: null,
            locked: false,
          },
          {
            id: 'ellipse1',
            type: 'ellipse',
            x: 350,
            y: 140,
            width: 160,
            height: 80,
            strokeColor: '#e8590c',
            backgroundColor: '#ffc078',
            fillStyle: 'solid',
            strokeWidth: 2,
            roughness: 1,
            opacity: 100,
            seed: 2,
            version: 1,
            versionNonce: 2,
            isDeleted: false,
            boundElements: null,
            updated: 1,
            link: null,
            locked: false,
          },
        ],
        appState: {},
        files: {},
      }),
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
      gap: '16px',
      cells: [
        {
          root: {
            children: [paragraph(text('Left column content with some text', FORMAT_BOLD))],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        {
          root: {
            children: [
              paragraph(text('Right column content with ', 0), text('italic text', FORMAT_ITALIC)),
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      ],
      version: 1,
    } as any),
  },
  {
    key: 'poll-single',
    label: 'Poll (Single Choice)',
    description: 'Reader-facing single-choice vote widget',
    category: 'block',
    data: doc(
      paragraph(text('Pick the cat species you find most charming:')),
      poll({
        pollId: 'p_demo_single',
        question: 'Which cat species do you prefer?',
        options: [
          { id: 'o_ragdoll', label: 'Ragdoll' },
          { id: 'o_amshort', label: 'American Shorthair' },
          { id: 'o_orange', label: 'Orange tabby' },
        ],
        mode: 'single',
      }) as any,
      paragraph(text('Votes drive the discussion below.')),
    ),
  },
  {
    key: 'poll-multiple',
    label: 'Poll (Multiple Choice)',
    description: 'Reader-facing multi-choice vote widget',
    category: 'block',
    data: doc(
      paragraph(text('Which pets have you raised? (multi-select)')),
      poll({
        pollId: 'p_demo_multi',
        question: 'Which pets have you raised?',
        options: [
          { id: 'o_cat', label: 'Cat' },
          { id: 'o_dog', label: 'Dog' },
          { id: 'o_hamster', label: 'Hamster' },
          { id: 'o_fish', label: 'Fish' },
        ],
        mode: 'multiple',
      }) as any,
    ),
  },
  {
    key: 'chat-user-agent',
    label: 'Chat (User · Agent)',
    description: 'Embedded conversation snapshot — user as bubble, agent as article',
    category: 'block',
    data: doc(
      paragraph(text('A captured exchange between user and assistant:')),
      chat({
        variant: 'user-agent',
        participants: [
          { id: 'p_u_demo', kind: 'user', name: 'Innei' },
          { id: 'p_a_demo', kind: 'agent', name: 'Claude' },
        ],
        messages: [
          {
            id: 'm_ua_1',
            participantId: 'p_u_demo',
            content: "How does Lexical's DecoratorNode differ from ElementNode?",
          },
          {
            id: 'm_ua_2',
            participantId: 'p_a_demo',
            content:
              "The two serve different purposes:\n\n- **ElementNode** contains other nodes — paragraphs, headings, lists.\n- **DecoratorNode** renders a React component as a leaf — polls, embeds, charts.\n\nUse a decorator when the content isn't editable as text.",
          },
          {
            id: 'm_ua_3',
            participantId: 'p_u_demo',
            content: 'Got it. So for the chat node we should subclass DecoratorNode.',
          },
        ],
      }) as any,
    ),
  },
  {
    key: 'chat-user-user',
    label: 'Chat (User · User)',
    description: 'Two-person dialogue — both sides as bubbles',
    category: 'block',
    data: doc(
      chat({
        variant: 'user-user',
        participants: [
          { id: 'p_alice_demo', kind: 'user', name: 'Alice' },
          { id: 'p_bob_demo', kind: 'user', name: 'Bob' },
        ],
        messages: [
          {
            id: 'm_uu_1',
            participantId: 'p_alice_demo',
            content: 'Are we still doing the static/edit split for the new chat node?',
          },
          {
            id: 'm_uu_2',
            participantId: 'p_bob_demo',
            content: 'Yes — same pattern as code-snippet.',
          },
          {
            id: 'm_uu_3',
            participantId: 'p_alice_demo',
            content: 'Perfect. Should I open a draft PR?',
          },
          {
            id: 'm_uu_4',
            participantId: 'p_bob_demo',
            content: "Hold on — let's get the spec approved first.",
          },
        ],
      }) as any,
    ),
  },
];
