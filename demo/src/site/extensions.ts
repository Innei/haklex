export interface ExtensionMeta {
  description: string;
  id: string;
  name: string;
  packageName: string;
  preview: string;
}

export const extensions: ExtensionMeta[] = [
  {
    id: 'litexml-import',
    name: 'LiteXML Import',
    description: 'Plain-text XML paste path for Markdown Flavor LiteXML nodes.',
    packageName: 'rich-litexml',
    preview: 'XML',
  },
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    description: 'Embedded whiteboard with remote and delta storage modes.',
    packageName: 'rich-ext-excalidraw',
    preview: 'Whiteboard',
  },
  {
    id: 'dynamic',
    name: 'Dynamic Component',
    description:
      'Remote ESM components mounted in shadow DOM with theme awareness and per-instance props.',
    packageName: 'rich-ext-dynamic',
    preview: 'Remote ESM',
  },
  {
    id: 'diff',
    name: 'Diff Viewer',
    description: 'Side-by-side rich diff with variant and theme support.',
    packageName: 'rich-diff',
    preview: 'Diff',
  },
  {
    id: 'agent-diff-node',
    name: 'Agent Diff Node',
    description: 'Reviewable AI-edit proposal rendered as a real Lexical node.',
    packageName: 'rich-ext-ai-agent',
    preview: 'Agent Diff',
  },
  {
    id: 'linkcard',
    name: 'Link Card',
    description: 'URL preview cards with extensible plugin matching.',
    packageName: 'rich-renderer-linkcard',
    preview: 'Link',
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    description: 'Syntax-highlighted code blocks with language detection.',
    packageName: 'rich-ext-code-snippet',
    preview: 'Code',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery node with grid and lightbox support.',
    packageName: 'rich-ext-gallery',
    preview: 'Gallery',
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'Static chat-snapshot node with user-agent and user-user variants.',
    packageName: 'rich-ext-chat',
    preview: 'Chat',
  },
  {
    id: 'mermaid',
    name: 'Mermaid',
    description: 'Sync SVG diagram rendering powered by Pele.',
    packageName: 'rich-renderer-mermaid',
    preview: 'Mermaid',
  },
];
