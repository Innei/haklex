import {
  BaseEveryUserContentProvider,
  BaseLastUserContentProvider,
  BaseSystemRoleProvider,
  BaseSystemRootProvider,
  buildDocumentContext,
  type ChatMessage,
  type MessageEngineContext,
  MessagesEngine,
  type PageContentContext,
  type PageSelection,
  type PreparedMessages,
} from '@haklex/rich-agent-core';
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

export class AgentMessagesEngine extends MessagesEngine {
  constructor(options: AgentMessagesEngineOptions = {}) {
    super([
      new DefaultSystemRoleInjector(normalizeSystemMessages(options.systemMessages)),
      new DocumentToolSystemInjector(options.toolSystemRole ?? defaultDocumentToolSystemRole),
      new PageSelectionsInjector(),
      new PageEditorContextInjector(),
    ]);
  }

  processWithEditor(params: {
    editorState: SerializedEditorState;
    userInput: string;
    title?: string;
  }): PreparedMessages {
    const userMessage: Extract<ChatMessage, { role: 'user' }> = {
      role: 'user',
      content: params.userInput,
      cacheBreakpoint: true,
    };

    return this.process({
      messages: [userMessage],
      pageContentContext: {
        metadata: { title: params.title ?? 'Current Document' },
        xml: buildDocumentContext(params.editorState, { mode: 'full', compact: true }),
      },
    });
  }
}
