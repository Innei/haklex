import { describe, expect, it } from 'vitest';

import { buildDocumentContext } from '../src/document-context';
import { buildMessages, MessagesEngine } from '../src/messages-engine/engine';
import {
  BaseEveryUserContentProvider,
  BaseFirstUserContentProvider,
  BaseLastUserContentProvider,
  BaseSystemRoleProvider,
  BaseSystemRootProvider,
  SYSTEM_CONTEXT_END,
  SYSTEM_CONTEXT_START,
} from '../src/messages-engine/processors';
import type { ChatMessage, MessageEngineContext, PreparedMessages } from '../src/protocol';

class SystemRootProvider extends BaseSystemRootProvider {
  constructor(private readonly messages: Array<Extract<ChatMessage, { role: 'system' }>>) {
    super();
  }

  protected buildMessages() {
    return this.messages;
  }
}

class SystemAppendProvider extends BaseSystemRoleProvider {
  constructor(private readonly content: string) {
    super();
  }

  protected buildContent() {
    return this.content;
  }
}

class BeforeFirstUserProvider extends BaseFirstUserContentProvider {
  constructor(private readonly message: ChatMessage) {
    super();
  }

  protected buildMessages() {
    return this.message;
  }
}

class EveryUserSelectionsProvider extends BaseEveryUserContentProvider {
  protected buildContentForMessage(message: Extract<ChatMessage, { role: 'user' }>) {
    const selections = message.metadata?.pageSelections as Array<{ xml: string }> | undefined;
    if (!selections?.length) return null;

    return {
      content: `<user_selections count="${selections.length}">${selections[0].xml}</user_selections>`,
      contextType: 'user_selections',
    };
  }
}

class LastUserContextProvider extends BaseLastUserContentProvider {
  constructor(private readonly content: string) {
    super();
  }

  protected buildContent(_context: MessageEngineContext) {
    return {
      content: this.content,
      contextType: 'current_page_context',
    };
  }
}

describe('messages engine', () => {
  it('assembles system root and preserves default preamble ordering', () => {
    const engine = new MessagesEngine([
      new SystemRootProvider([
        { role: 'system', content: 'You are an editor agent.', cacheBreakpoint: true },
      ]),
    ]);

    const preparedMessages = engine.process({
      messages: [{ role: 'user', content: 'Edit the selection', cacheBreakpoint: true }],
    });

    expect(preparedMessages.systemMessages).toHaveLength(1);
    expect(preparedMessages.preambleMessages).toHaveLength(1);
    expect(preparedMessages.preambleMessages[0]).toMatchObject({ content: 'Edit the selection' });
  });

  it('supports system append, before-first-user injection, every-user injection, and last-user injection', () => {
    const engine = new MessagesEngine([
      new SystemRootProvider([{ role: 'system', content: 'You are an editor agent.' }]),
      new SystemAppendProvider('Always use tools for edits.'),
      new BeforeFirstUserProvider({
        role: 'user',
        content: 'Context: draft title is introduction.',
      }),
      new EveryUserSelectionsProvider(),
      new LastUserContextProvider('<current_page title="Doc"><doc_xml_structure /></current_page>'),
    ]);

    const preparedMessages = engine.process({
      messages: [
        {
          role: 'user',
          content: 'Edit the selection',
          cacheBreakpoint: true,
          metadata: {
            pageSelections: [{ xml: '<p id="p1">hello</p>' }],
          },
        },
      ],
    });

    expect(preparedMessages.systemMessages).toEqual([
      {
        role: 'system',
        content: 'You are an editor agent.\n\nAlways use tools for edits.',
      },
    ]);
    expect(preparedMessages.preambleMessages).toHaveLength(2);
    expect(preparedMessages.preambleMessages[0]).toMatchObject({
      content: 'Context: draft title is introduction.',
    });
    expect(preparedMessages.preambleMessages[1]).toMatchObject({
      content: expect.stringContaining(
        '<user_selections count="1"><p id="p1">hello</p></user_selections>',
      ),
    });
    expect(preparedMessages.preambleMessages[1]).toMatchObject({
      content: expect.stringContaining(
        '<current_page title="Doc"><doc_xml_structure /></current_page>',
      ),
    });
    expect(preparedMessages.preambleMessages[1]).toMatchObject({
      content: expect.stringContaining(SYSTEM_CONTEXT_START),
    });
    expect(preparedMessages.preambleMessages[1]).toMatchObject({
      content: expect.stringContaining(SYSTEM_CONTEXT_END),
    });
  });
});

describe('buildMessages', () => {
  it('concatenates system + preamble + turns in order', () => {
    const preparedMessages: PreparedMessages = {
      systemMessages: [
        { role: 'system', content: 'You are an editor agent.', cacheBreakpoint: true },
      ],
      preambleMessages: [{ role: 'user', content: 'Edit the selection', cacheBreakpoint: true }],
      turns: [{ role: 'assistant', content: 'I will update it.' }],
    };
    const messages = buildMessages(preparedMessages);
    expect(messages).toHaveLength(3);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[2].role).toBe('assistant');
  });
});

describe('buildDocumentContext', () => {
  it('returns XML format with doc wrapper', () => {
    const state = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            $: { blockId: 'p1' },
            children: [
              {
                type: 'text',
                text: 'Hello',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as any;

    const xml = buildDocumentContext(state, { mode: 'full' });
    expect(xml).toBe('<doc><p id="p1">Hello</p></doc>');
  });

  it('can still render pretty XML when compact is disabled', () => {
    const state = {
      root: {
        type: 'root',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as any;
    const xml = buildDocumentContext(state, { mode: 'full', compact: false });
    expect(xml).toBe('<doc>\n</doc>\n');
  });
});
