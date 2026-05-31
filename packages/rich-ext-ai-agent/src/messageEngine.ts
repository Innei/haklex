import {
  BaseEveryUserContentProvider,
  BaseLastUserContentProvider,
  BaseSystemRoleProvider,
  BaseSystemRootProvider,
  buildDocumentContext,
  type CapturedSelection,
  type CapturedTextSelection,
  type ChatMessage,
  type MessageEngineContext,
  MessagesEngine,
  type PageContentContext,
  type PageSelection,
  type PreparedMessages,
} from '@haklex/rich-agent-core';
import { createDefaultRegistry, serializeNodesToXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

import defaultSystemRoleMarkdown from './prompts/default-system-role.md?raw';
import documentToolSystemRoleMarkdown from './prompts/document-tool-system-role.md?raw';

export const defaultAgentSystemRole = defaultSystemRoleMarkdown.trim();
export const defaultDocumentToolSystemRole = documentToolSystemRoleMarkdown.trim();

export const defaultAgentSystemMessage: Extract<ChatMessage, { role: 'system' }> = {
  role: 'system',
  content: defaultAgentSystemRole,
  cacheBreakpoint: true,
};

export type AgentMessagesEngineOptions = {
  systemMessages?: ChatMessage[];
  toolSystemRole?: string;
};

function normalizeSystemMessages(
  messages: ChatMessage[] | undefined,
): Array<Extract<ChatMessage, { role: 'system' }>> {
  return (messages ?? [defaultAgentSystemMessage]).filter(
    (message): message is Extract<ChatMessage, { role: 'system' }> => message.role === 'system',
  );
}

function formatPageSelections(selections: PageSelection[]): string {
  if (!selections.length) return '';

  const formattedSelections = selections
    .map((selection) => {
      const lineInfo =
        selection.startLine !== undefined
          ? ` lines="${selection.startLine}-${selection.endLine ?? selection.startLine}"`
          : '';

      return `<selection${lineInfo}>
${selection.xml}
</selection>`;
    })
    .join('\n');

  return `<user_selections count="${selections.length}">
${formattedSelections}
</user_selections>`;
}

function formatTextSelection(selection: CapturedTextSelection): string {
  return `<text_selection>
<selected_text>${selection.text}</selected_text>
<anchor blockId="${selection.anchorBlockId}" offset="${selection.anchorOffset}" />
<focus blockId="${selection.focusBlockId}" offset="${selection.focusOffset}" />
<containing_blocks>
${selection.containingBlocksXml}
</containing_blocks>
</text_selection>`;
}

function formatPageContentContext(context: PageContentContext): string {
  const sections: string[] = [];

  if (context.markdown) {
    const charCount = context.metadata.charCount ?? context.markdown.length;
    const lineCount = context.metadata.lineCount ?? context.markdown.split('\n').length;
    sections.push(`<markdown chars="${charCount}" lines="${lineCount}">
${context.markdown}
</markdown>`);
  }

  if (context.xml) {
    sections.push(`<doc_xml_structure>
<instruction>IMPORTANT: Use node IDs from this XML structure when performing modify or remove operations.</instruction>
${context.xml}
</doc_xml_structure>`);
  }

  return `<current_page title="${context.metadata.title}">
${sections.join('\n')}
</current_page>`;
}

function resolvePageContentContext(context: MessageEngineContext): PageContentContext | undefined {
  if (context.pageContentContext) {
    return context.pageContentContext;
  }

  const initialPageEditor = context.initialContext?.pageEditor;
  if (!initialPageEditor) return undefined;

  return {
    markdown: initialPageEditor.markdown,
    metadata: initialPageEditor.metadata,
    xml: context.stepContext?.stepPageEditor?.xml || initialPageEditor.xml,
  };
}

class DefaultSystemRoleInjector extends BaseSystemRootProvider {
  constructor(private readonly systemMessages: Array<Extract<ChatMessage, { role: 'system' }>>) {
    super();
  }

  protected buildMessages() {
    return this.systemMessages;
  }
}

class DocumentToolSystemInjector extends BaseSystemRoleProvider {
  constructor(private readonly toolSystemRole: string) {
    super();
  }

  protected buildContent() {
    return this.toolSystemRole;
  }
}

class PageSelectionsInjector extends BaseEveryUserContentProvider {
  protected buildContentForMessage(message: Extract<ChatMessage, { role: 'user' }>) {
    const pageSelections = message.metadata?.pageSelections as PageSelection[] | undefined;
    if (!pageSelections?.length) return null;

    const formattedSelections = formatPageSelections(pageSelections);
    if (!formattedSelections) return null;

    return {
      content: formattedSelections,
      contextType: 'user_selections',
    };
  }
}

class TextSelectionInjector extends BaseLastUserContentProvider {
  protected buildContent(context: MessageEngineContext) {
    const textSelection = context.textSelection;
    if (!textSelection) return null;

    const formatted = formatTextSelection(textSelection);
    if (!formatted) return null;

    return {
      content: formatted,
      contextType: 'text_selection',
    };
  }
}

class PageEditorContextInjector extends BaseLastUserContentProvider {
  protected buildContent(context: MessageEngineContext) {
    const pageContentContext = resolvePageContentContext(context);
    if (!pageContentContext) return null;

    const formattedContent = formatPageContentContext(pageContentContext);
    if (!formattedContent) return null;

    return {
      content: formattedContent,
      contextType: 'current_page_context',
    };
  }
}

function buildTextSelectionContext(
  editorState: SerializedEditorState,
  selection: Extract<CapturedSelection, { type: 'text' }>,
): CapturedTextSelection {
  const root = editorState.root as any;
  const children: any[] = root.children ?? [];

  const blockIds = new Set<string>([selection.anchorBlockId, selection.focusBlockId]);

  if (selection.anchorBlockId !== selection.focusBlockId) {
    let inRange = false;
    for (const child of children) {
      const blockId = child.$?.blockId;
      if (blockId === selection.anchorBlockId || blockId === selection.focusBlockId) {
        blockIds.add(blockId);
        if (inRange) break;
        inRange = true;
      } else if (inRange && blockId) {
        blockIds.add(blockId);
      }
    }
  }

  const containingNodes = children.filter((child) => {
    const blockId = child.$?.blockId;
    return blockId && blockIds.has(blockId);
  });

  const registry = createDefaultRegistry();
  const containingBlocksXml = serializeNodesToXml(containingNodes, registry, { compact: true });

  return {
    text: selection.text,
    anchorBlockId: selection.anchorBlockId,
    anchorOffset: selection.anchorOffset,
    focusBlockId: selection.focusBlockId,
    focusOffset: selection.focusOffset,
    containingBlocksXml,
  };
}

export class AgentMessagesEngine extends MessagesEngine {
  constructor(options: AgentMessagesEngineOptions = {}) {
    super([
      new DefaultSystemRoleInjector(normalizeSystemMessages(options.systemMessages)),
      new DocumentToolSystemInjector(options.toolSystemRole ?? defaultDocumentToolSystemRole),
      new PageSelectionsInjector(),
      new TextSelectionInjector(),
      new PageEditorContextInjector(),
    ]);
  }

  processWithEditor(params: {
    editorState: SerializedEditorState;
    messages?: ChatMessage[];
    userInput: string;
    title?: string;
    selection?: CapturedSelection | null;
  }): PreparedMessages {
    const userMessage: Extract<ChatMessage, { role: 'user' }> = {
      role: 'user',
      content: params.userInput,
      cacheBreakpoint: true,
    };

    const selectedBlockIds =
      params.selection?.type === 'block' ? new Set(params.selection.blockIds) : undefined;

    const textSelection =
      params.selection?.type === 'text'
        ? buildTextSelectionContext(params.editorState, params.selection)
        : undefined;

    return this.process({
      messages: [...(params.messages ?? []), userMessage],
      pageContentContext: {
        metadata: { title: params.title ?? 'Current Document' },
        xml: buildDocumentContext(params.editorState, {
          mode: 'full',
          compact: true,
          selectedBlockIds,
        }),
      },
      textSelection,
    });
  }
}
