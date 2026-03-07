import type { SerializedEditorState } from 'lexical'

import {
  alertQuote,
  doc,
  excalidraw,
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

// ── Excalidraw diagram element builders ──────────────────────────

let _exSeed = 1000

function _exBox(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
  label: string,
) {
  const tid = `${id}_t`
  return [
    {
      id,
      type: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      strokeColor: '#1e1e1e',
      backgroundColor: bg,
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      seed: _exSeed++,
      version: 1,
      versionNonce: _exSeed++,
      isDeleted: false,
      boundElements: [{ id: tid, type: 'text' }],
      updated: 1,
      link: null,
      locked: false,
    },
    {
      id: tid,
      type: 'text',
      x: x + 10,
      y: y + h / 2 - 10,
      width: w - 20,
      height: 20,
      text: label,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: id,
      originalText: label,
      autoResize: true,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: _exSeed++,
      version: 1,
      versionNonce: _exSeed++,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      lineHeight: 1.25,
    },
  ]
}

function _exArrow(
  id: string,
  x: number,
  y: number,
  pts: [number, number][],
  from?: string,
  to?: string,
) {
  return {
    id,
    type: 'arrow',
    x,
    y,
    width: 0,
    height: 0,
    points: pts,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    angle: 0,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: _exSeed++,
    version: 1,
    versionNonce: _exSeed++,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    startBinding: from
      ? { elementId: from, focus: 0, gap: 5, fixedPoint: null }
      : null,
    endBinding: to
      ? { elementId: to, focus: 0, gap: 5, fixedPoint: null }
      : null,
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  }
}

function _exDiagram(...parts: any[]) {
  return JSON.stringify({
    elements: parts.flat(),
    appState: { viewBackgroundColor: '#ffffff' },
  })
}

// Diagram 1: System architecture overview
const diagramArchitecture = _exDiagram(
  _exBox('c1', 30, 100, 120, 50, '#a5d8ff', 'Client'),
  _exBox('gw', 230, 100, 150, 50, '#b2f2bb', 'API Gateway'),
  _exBox('s1', 470, 20, 160, 50, '#ffd8a8', 'User Service'),
  _exBox('s2', 470, 100, 160, 50, '#ffd8a8', 'Order Service'),
  _exBox('s3', 470, 180, 160, 50, '#ffd8a8', 'Product Service'),
  _exArrow(
    'a1',
    150,
    125,
    [
      [0, 0],
      [80, 0],
    ],
    'c1',
    'gw',
  ),
  _exArrow(
    'a2',
    380,
    125,
    [
      [0, 0],
      [90, -80],
    ],
    'gw',
    's1',
  ),
  _exArrow(
    'a3',
    380,
    125,
    [
      [0, 0],
      [90, 0],
    ],
    'gw',
    's2',
  ),
  _exArrow(
    'a4',
    380,
    125,
    [
      [0, 0],
      [90, 80],
    ],
    'gw',
    's3',
  ),
)

// Diagram 2: Request lifecycle (vertical)
const diagramRequestFlow = _exDiagram(
  _exBox('r1', 80, 10, 180, 45, '#d0bfff', 'Client Request'),
  _exBox('r2', 80, 95, 180, 45, '#a5d8ff', 'Load Balancer'),
  _exBox('r3', 80, 180, 180, 45, '#b2f2bb', 'API Gateway'),
  _exBox('r4', 80, 265, 180, 45, '#ffd8a8', 'Auth Middleware'),
  _exBox('r5', 80, 350, 180, 45, '#ffc9c9', 'Service Handler'),
  _exBox('r6', 80, 435, 180, 45, '#d0bfff', 'JSON Response'),
  _exArrow(
    'ra1',
    170,
    55,
    [
      [0, 0],
      [0, 40],
    ],
    'r1',
    'r2',
  ),
  _exArrow(
    'ra2',
    170,
    140,
    [
      [0, 0],
      [0, 40],
    ],
    'r2',
    'r3',
  ),
  _exArrow(
    'ra3',
    170,
    225,
    [
      [0, 0],
      [0, 40],
    ],
    'r3',
    'r4',
  ),
  _exArrow(
    'ra4',
    170,
    310,
    [
      [0, 0],
      [0, 40],
    ],
    'r4',
    'r5',
  ),
  _exArrow(
    'ra5',
    170,
    395,
    [
      [0, 0],
      [0, 40],
    ],
    'r5',
    'r6',
  ),
)

// Diagram 3: Event-driven communication
const diagramEventDriven = _exDiagram(
  _exBox('p1', 20, 30, 140, 50, '#a5d8ff', 'Order Service'),
  _exBox('p2', 20, 130, 140, 50, '#a5d8ff', 'Payment Service'),
  _exBox('mq', 240, 80, 160, 50, '#ffe066', 'Message Broker'),
  _exBox('c1x', 490, 30, 150, 50, '#b2f2bb', 'Notification'),
  _exBox('c2x', 490, 130, 150, 50, '#b2f2bb', 'Analytics'),
  _exArrow(
    'ea1',
    160,
    55,
    [
      [0, 0],
      [80, 50],
    ],
    'p1',
    'mq',
  ),
  _exArrow(
    'ea2',
    160,
    155,
    [
      [0, 0],
      [80, -50],
    ],
    'p2',
    'mq',
  ),
  _exArrow(
    'ea3',
    400,
    105,
    [
      [0, 0],
      [90, -50],
    ],
    'mq',
    'c1x',
  ),
  _exArrow(
    'ea4',
    400,
    105,
    [
      [0, 0],
      [90, 50],
    ],
    'mq',
    'c2x',
  ),
)

// Diagram 4: Database per service
const diagramDatabase = _exDiagram(
  _exBox('ds1', 30, 20, 150, 50, '#a5d8ff', 'User Service'),
  _exBox('ds2', 30, 110, 150, 50, '#a5d8ff', 'Order Service'),
  _exBox('ds3', 30, 200, 150, 50, '#a5d8ff', 'Product Service'),
  _exBox('db1', 280, 20, 170, 50, '#ffc9c9', 'PostgreSQL'),
  _exBox('db2', 280, 110, 170, 50, '#ffd8a8', 'MongoDB'),
  _exBox('db3', 280, 200, 170, 50, '#b2f2bb', 'Redis + Search'),
  _exBox('bus', 140, 290, 220, 45, '#ffe066', 'Event Bus'),
  _exArrow(
    'da1',
    180,
    45,
    [
      [0, 0],
      [100, 0],
    ],
    'ds1',
    'db1',
  ),
  _exArrow(
    'da2',
    180,
    135,
    [
      [0, 0],
      [100, 0],
    ],
    'ds2',
    'db2',
  ),
  _exArrow(
    'da3',
    180,
    225,
    [
      [0, 0],
      [100, 0],
    ],
    'ds3',
    'db3',
  ),
  _exArrow(
    'da4',
    105,
    250,
    [
      [0, 0],
      [145, 40],
    ],
    'ds1',
    'bus',
  ),
  _exArrow(
    'da5',
    105,
    160,
    [
      [0, 0],
      [145, 130],
    ],
    'ds2',
    'bus',
  ),
  _exArrow(
    'da6',
    105,
    250,
    [
      [0, 0],
      [145, 40],
    ],
    'ds3',
    'bus',
  ),
)

// Diagram 5: CI/CD Pipeline
const diagramCICD = _exDiagram(
  _exBox('ci1', 10, 60, 110, 50, '#d0bfff', 'Git Push'),
  _exBox('ci2', 160, 60, 110, 50, '#a5d8ff', 'Build'),
  _exBox('ci3', 310, 60, 110, 50, '#ffe066', 'Test'),
  _exBox('ci4', 460, 60, 120, 50, '#ffd8a8', 'Staging'),
  _exBox('ci5', 630, 60, 130, 50, '#b2f2bb', 'Production'),
  _exArrow(
    'ca1',
    120,
    85,
    [
      [0, 0],
      [40, 0],
    ],
    'ci1',
    'ci2',
  ),
  _exArrow(
    'ca2',
    270,
    85,
    [
      [0, 0],
      [40, 0],
    ],
    'ci2',
    'ci3',
  ),
  _exArrow(
    'ca3',
    420,
    85,
    [
      [0, 0],
      [40, 0],
    ],
    'ci3',
    'ci4',
  ),
  _exArrow(
    'ca4',
    580,
    85,
    [
      [0, 0],
      [50, 0],
    ],
    'ci4',
    'ci5',
  ),
)

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
    key: 'excalidraw-showcase',
    label: 'Excalidraw Whiteboard',
    description:
      'Extension node demo: interactive excalidraw canvas via extraNodes + children plugin',
    data: doc(
      heading('h1', text('Excalidraw Whiteboard Extension')),

      paragraph(
        text('This preset demonstrates the '),
        text('@haklex/rich-ext-excalidraw', FORMAT_CODE),
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
            'The excalidraw node is registered as an extension, not a built-in. It uses RichEditor children slot for the ExcalidrawPlugin and extraNodes for node registration.',
          ),
        ),
      ) as any,

      heading('h2', text('Empty Canvas')),

      paragraph(
        text(
          'Below is an interactive excalidraw canvas. In editor mode, you can draw, add shapes, and interact with it directly.',
        ),
      ),

      {
        type: 'excalidraw',
        snapshot: '{}',
        version: 1,
      } as any,

      horizontalRule(),

      heading('h2', text('How It Works')),

      {
        type: 'code-block',
        language: 'tsx',
        code: `import { ExcalidrawNode, ExcalidrawPlugin } from '@haklex/rich-ext-excalidraw'

// Editor: register node + plugin
<RichEditor extraNodes={[ExcalidrawNode]}>
  <ExcalidrawPlugin />
</RichEditor>

// Renderer: register node only
<RichRenderer extraNodes={[ExcalidrawNode]} value={state} />`,
        version: 1,
      } as any,

      alertQuote(
        'note',
        paragraph(
          text(
            'The snapshot is stored as a JSON string in the Lexical state. The excalidraw editor auto-persists changes back to the node.',
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
  {
    key: 'excalidraw-multi-board',
    label: 'Tech Article (Multi-Excalidraw)',
    description:
      'Technical article with multiple Excalidraw whiteboards for lazy-loading testing',
    data: doc(
      heading('h1', text('微服务架构设计与实践')),

      paragraph(
        text(
          '微服务架构将单体应用拆分为一组小型、自治的服务，每个服务围绕特定业务能力构建，独立部署、独立扩展。本文结合架构图，系统阐述微服务的核心设计要点。',
        ),
      ),

      alertQuote(
        'tip',
        paragraph(
          text(
            '本文包含多个 Excalidraw 画板，用于验证画板的懒加载能力。仅当画板滚动至视口 50% 可见时才开始加载。',
          ),
        ),
      ) as any,

      // ── Section 1: Architecture Overview ──
      heading('h2', text('系统架构总览')),

      paragraph(
        text('典型的微服务系统由 '),
        text('API Gateway', FORMAT_CODE),
        text(
          ' 统一对外暴露接口，内部按业务域拆分为若干独立服务。客户端的所有请求均经由网关路由至对应的下游服务。',
        ),
      ),

      excalidraw(diagramArchitecture) as any,

      paragraph(
        text(
          '上图展示了一个简化的微服务拓扑：客户端通过 API Gateway 访问三个核心服务——',
        ),
        text('User Service', FORMAT_BOLD),
        text('、'),
        text('Order Service', FORMAT_BOLD),
        text(' 和 '),
        text('Product Service', FORMAT_BOLD),
        text('。网关负责请求路由、认证鉴权、限流熔断等横切关注点。'),
      ),

      horizontalRule(),

      // ── Section 2: Request Lifecycle ──
      heading('h2', text('请求生命周期')),

      paragraph(
        text(
          '一个 HTTP 请求从客户端发出到最终收到响应，会经历多个中间层的处理。理解这一流程有助于定位性能瓶颈和故障点。',
        ),
      ),

      excalidraw(diagramRequestFlow) as any,

      paragraph(
        text('请求首先到达 '),
        text('Load Balancer', FORMAT_CODE),
        text(' 进行流量分发，随后经过 '),
        text('API Gateway', FORMAT_CODE),
        text(' 的认证中间件校验身份，最终由具体的 '),
        text('Service Handler', FORMAT_CODE),
        text(' 处理业务逻辑并返回 JSON 响应。'),
      ),

      list(
        'bullet',
        listItem(
          paragraph(
            text('Load Balancer', FORMAT_BOLD),
            text('：基于 Round Robin 或 Least Connections 策略分发流量'),
          ),
        ),
        listItem(
          paragraph(
            text('Auth Middleware', FORMAT_BOLD),
            text('：JWT 令牌验证 + RBAC 权限校验'),
          ),
        ),
        listItem(
          paragraph(
            text('Service Handler', FORMAT_BOLD),
            text('：业务逻辑执行、数据库交互、缓存查询'),
          ),
        ),
      ),

      horizontalRule(),

      // ── Section 3: Event-Driven Communication ──
      heading('h2', text('事件驱动通信')),

      paragraph(
        text('微服务间的通信分为 '),
        text('同步', FORMAT_BOLD),
        text('（HTTP/gRPC）和 '),
        text('异步', FORMAT_BOLD),
        text(
          '（消息队列）两种模式。对于不需要即时响应的场景，事件驱动架构可以显著降低服务间耦合。',
        ),
      ),

      excalidraw(diagramEventDriven) as any,

      paragraph(
        text('上图展示了事件驱动模式：Order Service 和 Payment Service 作为 '),
        text('Producer', FORMAT_ITALIC),
        text(' 将事件发布到 Message Broker，Notification 和 Analytics 作为 '),
        text('Consumer', FORMAT_ITALIC),
        text(' 订阅并异步处理这些事件。'),
      ),

      alertQuote(
        'note',
        paragraph(
          text(
            '常见的消息中间件选型包括 Kafka（高吞吐）、RabbitMQ（灵活路由）和 Redis Streams（轻量级）。选择时需权衡吞吐量、持久化、消息顺序等因素。',
          ),
        ),
      ) as any,

      horizontalRule(),

      // ── Section 4: Data Architecture ──
      heading('h2', text('数据架构：Database per Service')),

      paragraph(
        text('微服务的核心原则之一是 '),
        text('数据自治', FORMAT_BOLD),
        text(
          '——每个服务拥有自己的数据存储，不直接访问其他服务的数据库。跨服务的数据一致性通过事件总线实现最终一致。',
        ),
      ),

      excalidraw(diagramDatabase) as any,

      paragraph(
        text(
          '不同服务可以根据业务特点选择最合适的数据库类型：User Service 使用 PostgreSQL 保证事务一致性，Order Service 使用 MongoDB 应对灵活的文档结构，Product Service 使用 Redis + 全文检索引擎加速查询。',
        ),
      ),

      {
        type: 'code-block',
        language: 'typescript',
        code: `// Event Bus 消息发布示例
interface OrderCreatedEvent {
  orderId: string
  userId: string
  items: Array<{ productId: string; quantity: number }>
  total: number
  createdAt: Date
}

await eventBus.publish('order.created', {
  orderId: '12345',
  userId: 'user_001',
  items: [{ productId: 'prod_a', quantity: 2 }],
  total: 299.0,
  createdAt: new Date(),
} satisfies OrderCreatedEvent)`,
        version: 1,
      } as any,

      horizontalRule(),

      // ── Section 5: CI/CD Pipeline ──
      heading('h2', text('持续集成与部署')),

      paragraph(
        text(
          '微服务的独立部署特性要求成熟的 CI/CD 流水线支持。每个服务从代码提交到生产发布，应经历完整的自动化构建、测试和部署阶段。',
        ),
      ),

      excalidraw(diagramCICD) as any,

      paragraph(text('流水线各阶段职责：')),

      list(
        'number',
        listItem(
          paragraph(
            text('Git Push', FORMAT_BOLD),
            text('：触发 Webhook，启动 CI 流水线'),
          ),
        ),
        listItem(
          paragraph(
            text('Build', FORMAT_BOLD),
            text('：编译代码、构建 Docker 镜像、推送至 Registry'),
          ),
        ),
        listItem(
          paragraph(
            text('Test', FORMAT_BOLD),
            text('：单元测试 + 集成测试 + E2E 测试，覆盖率门禁'),
          ),
        ),
        listItem(
          paragraph(
            text('Staging', FORMAT_BOLD),
            text('：部署至预发环境，执行冒烟测试和性能基准'),
          ),
        ),
        listItem(
          paragraph(
            text('Production', FORMAT_BOLD),
            text('：金丝雀发布或蓝绿部署，渐进式流量切换'),
          ),
        ),
      ),

      horizontalRule(),

      heading('h2', text('总结')),

      paragraph(
        text(
          '微服务架构并非银弹，它用运维复杂度换取了开发灵活性和可扩展性。合理的服务拆分、清晰的通信模式、自治的数据架构以及成熟的 CI/CD 流程，是微服务成功落地的四大支柱。',
        ),
      ),

      quote(
        paragraph(
          text(
            'The microservice architectural style is an approach to developing a single application as a suite of small services, each running in its own process and communicating with lightweight mechanisms.',
            FORMAT_ITALIC,
          ),
        ),
        paragraph(text('— Martin Fowler')),
      ),
    ),
  },
]
