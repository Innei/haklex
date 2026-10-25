import type { FC } from 'react';

import { AgentDiffNodeDetail } from './AgentDiffNode';
import { ChatDetail } from './Chat';
import { CodeSnippetDetail } from './CodeSnippet';
import { DiffDetail } from './Diff';
import { DynamicDetail } from './Dynamic';
import { ExcalidrawDetail } from './Excalidraw';
import { GalleryDetail } from './Gallery';
import { LinkCardDetail } from './LinkCard';
import { LiteXmlImportDetail } from './LiteXmlImport';
import { MermaidDetail } from './Mermaid';

export const extensionDetails: Record<string, FC> = {
  'litexml-import': LiteXmlImportDetail,
  'excalidraw': ExcalidrawDetail,
  'dynamic': DynamicDetail,
  'diff': DiffDetail,
  'agent-diff-node': AgentDiffNodeDetail,
  'linkcard': LinkCardDetail,
  'code-snippet': CodeSnippetDetail,
  'gallery': GalleryDetail,
  'chat': ChatDetail,
  'mermaid': MermaidDetail,
};
