import type { SerializedEditorState } from 'lexical';

import {
  alertQuote,
  doc,
  FORMAT_BOLD,
  FORMAT_CODE,
  FORMAT_ITALIC,
  heading,
  horizontalRule,
  list,
  listItem,
  nestedDoc,
  paragraph,
  poll,
  quote,
  table,
  tableCell,
  tableRow,
  text,
} from './helpers';

export const initialContent: SerializedEditorState = doc(
  heading('h1', text('Rich Editor Demo')),

  paragraph(
    text('Welcome to the '),
    text('@haklex/rich-editor', FORMAT_CODE),
    text(' playground. Try '),
    text('markdown shortcuts', FORMAT_BOLD),
    text(', '),
    text('inline formatting', FORMAT_ITALIC),
    text(', and custom blocks below.'),
  ),

  heading('h2', text('Inline Features')),

  paragraph(
    text('Supports '),
    text('bold', FORMAT_BOLD),
    text(', '),
    text('italic', FORMAT_ITALIC),
    text(', '),
    text('inline code', FORMAT_CODE),
    text(', and '),
    {
      type: 'spoiler',
      children: [text('hidden spoiler text')],
      version: 1,
    } as any,
    text('. Math: '),
    {
      type: 'katex-inline',
      equation: 'E = mc^2',
      version: 1,
    } as any,
    text('. Mention: '),
    {
      type: 'mention',
      platform: 'GH',
      handle: 'innei',
      version: 1,
    } as any,
    text('.'),
  ),

  heading('h2', text('Alerts')),

  alertQuote('note', paragraph(text('This is a note alert for additional context.'))) as any,

  alertQuote(
    'tip',
    paragraph(text('Pro tip: Use '), text('pnpm', FORMAT_CODE), text(' for faster installs.')),
  ) as any,

  heading('h2', text('Code Block')),

  {
    type: 'code-block',
    language: 'typescript',
    code: `function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))`,
    version: 1,
  } as any,

  heading('h2', text('Code Snippet')),

  {
    type: 'code-snippet',
    files: [
      {
        filename: 'app.tsx',
        code: `import { useState } from 'react'\n\nexport function App() {\n  const [count, setCount] = useState(0)\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  )\n}`,
        language: 'tsx',
      },
      {
        filename: 'main.ts',
        code: `import { createRoot } from 'react-dom/client'\nimport { App } from './app'\n\ncreateRoot(document.getElementById('root')!).render(<App />)`,
        language: 'tsx',
      },
      {
        filename: 'package.json',
        code: `{\n  "name": "my-app",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}`,
        language: 'json',
      },
    ],
    version: 1,
  } as any,

  heading('h2', text('Lists & Tasks')),

  list(
    'bullet',
    listItem(paragraph(text('First item'))),
    listItem(paragraph(text('Second item'))),
    listItem(paragraph(text('Third item'))),
  ),

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
        children: [paragraph(text('Implement nodes'))],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
      {
        type: 'listitem',
        checked: true,
        value: 2,
        children: [paragraph(text('Add transformers'))],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
      {
        type: 'listitem',
        checked: false,
        value: 3,
        children: [paragraph(text('Write unit tests'))],
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

  heading('h3', text('Nested Lists')),

  list(
    'bullet',
    listItem(paragraph(text('Top-level bullet'))),
    listItem(
      list(
        'bullet',
        listItem(paragraph(text('Second level'))),
        listItem(
          list(
            'bullet',
            listItem(paragraph(text('Third level (square marker)'))),
            listItem(paragraph(text('Another deep item'))),
          ),
        ),
        listItem(paragraph(text('Back to second level'))),
      ),
    ),
    listItem(paragraph(text('Top-level bullet again'))),
  ),

  list(
    'number',
    listItem(paragraph(text('Ordered step one'))),
    listItem(
      list(
        'number',
        listItem(paragraph(text('Sub-step a (lower-alpha)'))),
        listItem(paragraph(text('Sub-step b'))),
      ),
    ),
    listItem(paragraph(text('Ordered step two'))),
  ),

  heading('h2', text('Mermaid Diagram')),

  {
    type: 'mermaid',
    diagram: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,
    version: 1,
  } as any,

  heading('h2', text('Blockquote & Math')),

  quote(paragraph(text('The best code is no code at all.', FORMAT_ITALIC))),

  {
    type: 'katex-block',
    equation: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    version: 1,
  } as any,

  horizontalRule(),

  heading('h2', text('Image')),

  {
    type: 'image',
    src: 'https://picsum.photos/1200/720?random=510',
    altText: 'Sample landscape',
    caption: 'Enhanced image renderer: thumbhash placeholder + click to zoom',
    width: 1200,
    height: 720,
    thumbhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    accent: '#7ba8c4',
    version: 1,
  } as any,

  heading('h2', text('Video')),

  {
    type: 'video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://picsum.photos/1200/675?random=511',
    width: 1200,
    height: 675,
    version: 1,
  } as any,

  heading('h2', text('Collapsible')),

  {
    type: 'details',
    summary: 'Click to expand',
    open: false,
    children: [paragraph(text('Hidden content revealed on toggle.'))],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  } as any,

  heading('h2', text('Nested Document')),

  nestedDoc(
    heading('h3', text('Embedded Document')),
    paragraph(
      text('This is a '),
      text('nested document', FORMAT_BOLD),
      text(' embedded within the parent document. It supports all node types.'),
    ),
    paragraph(
      text('You can include '),
      text('rich formatting', FORMAT_ITALIC),
      text(', code like '),
      text('console.log()', FORMAT_CODE),
      text(', and more.'),
    ),
    list(
      'bullet',
      listItem(paragraph(text('Collapsed by default at 400px'))),
      listItem(paragraph(text('Expand to see full content'))),
      listItem(paragraph(text('In edit mode, click to open modal editor'))),
    ),
    heading('h4', text('Code Block')),
    {
      type: 'code-block',
      language: 'typescript',
      code: `// Nested doc supports code blocks
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('nested'))`,
      version: 1,
    } as any,
    heading('h4', text('Table')),
    table(
      tableRow(
        tableCell(1, paragraph(text('Node'))),
        tableCell(1, paragraph(text('Support'))),
        tableCell(1, paragraph(text('Edit'))),
        tableCell(1, paragraph(text('Render'))),
        tableCell(1, paragraph(text('Nested'))),
        tableCell(1, paragraph(text('SSR'))),
        tableCell(1, paragraph(text('Note'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('Table'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Resize, add/remove rows'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('Code Block'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Syntax highlight'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('Image'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Thumbhash placeholder'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('Mermaid'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Diagram render'))),
      ),
      tableRow(
        tableCell(0, paragraph(text('KaTeX'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Yes'))),
        tableCell(0, paragraph(text('Inline & block math'))),
      ),
    ),
    paragraph(text('Paragraph 4: Additional content to demonstrate truncation behavior.')),
    paragraph(text('Paragraph 5: The nested document can hold substantial content.')),
    paragraph(text('Paragraph 6: Readers see a preview with a gradient mask overlay.')),
    paragraph(text('Paragraph 7: Click the expand button to reveal everything.')),
    paragraph(text('Paragraph 8: The editor modal provides full editing capabilities.')),
    paragraph(text('Paragraph 9: Changes sync back to the parent document on save.')),
    paragraph(text('Paragraph 10: This line should be truncated in collapsed view.')),
    paragraph(text('Paragraph 11: Only visible after expanding.')),
    paragraph(text('Paragraph 12: Final paragraph of the nested document.')),
  ) as any,

  heading('h2', text('Poll')),

  paragraph(text('Polls render interactively in the readonly renderer below — try voting:')),

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

  poll({
    pollId: 'p_demo_multi',
    question: 'Which pets have you raised? (multi-select)',
    options: [
      { id: 'o_cat', label: 'Cat' },
      { id: 'o_dog', label: 'Dog' },
      { id: 'o_hamster', label: 'Hamster' },
      { id: 'o_fish', label: 'Fish' },
    ],
    mode: 'multiple',
  }) as any,

  heading('h2', text('Link Card')),

  {
    type: 'link-card',
    url: 'https://lexical.dev',
    title: 'Lexical - Extensible Text Editor Framework',
    description: 'An extensible JavaScript web text-editor framework by Meta.',
    favicon: 'https://lexical.dev/favicon.ico',
    version: 1,
  } as any,

  paragraph(text('Start editing above, or import JSON via the toolbar.', FORMAT_ITALIC)),
);
