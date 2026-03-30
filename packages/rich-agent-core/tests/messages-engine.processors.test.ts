import { describe, expect, it } from 'vitest';

import { BaseEveryUserContentProvider } from '../src/messages-engine/base/BaseEveryUserContentProvider';
import { BaseFirstUserContentProvider } from '../src/messages-engine/base/BaseFirstUserContentProvider';
import { BaseLastUserContentProvider } from '../src/messages-engine/base/BaseLastUserContentProvider';
import { BaseMessageEngineProcessor } from '../src/messages-engine/base/BaseMessageEngineProcessor';
import { BaseSystemRoleProvider } from '../src/messages-engine/base/BaseSystemRoleProvider';
import { BaseSystemRootProvider } from '../src/messages-engine/base/BaseSystemRootProvider';
import {
  CONTEXT_INSTRUCTION,
  SYSTEM_CONTEXT_END,
  SYSTEM_CONTEXT_START,
} from '../src/messages-engine/base/constants';
import type { ChatMessage, MessageDraft, MessageEngineContext } from '../src/protocol';

function chatMessageContent(message: ChatMessage): string {
  switch (message.role) {
    case 'assistant_tool_call': {
      return '';
    }
    case 'system':
    case 'user':
    case 'assistant':
    case 'tool_result': {
      return message.content;
    }
  }
}

function createUserMessage(
  content: string,
  metadata?: Extract<ChatMessage, { role: 'user' }>['metadata'],
): Extract<ChatMessage, { role: 'user' }> {
  return { role: 'user', content, metadata };
}

function createDraft(messages: ChatMessage[] = [createUserMessage('Primary task')]): MessageDraft {
  return {
    systemMessages: [],
    messages,
  };
}

function createContext(
  messages: ChatMessage[] = [createUserMessage('Primary task')],
): MessageEngineContext {
  return { messages };
}

class SkipProcessor extends BaseMessageEngineProcessor {
  protected override shouldProcess(): boolean {
    return false;
  }

  protected override doProcess(draft: MessageDraft): MessageDraft {
    draft.systemMessages = [{ role: 'system', content: 'should not run' }];
    return draft;
  }
}

class CloneCheckProcessor extends BaseMessageEngineProcessor {
  protected override doProcess(draft: MessageDraft): MessageDraft {
    draft.systemMessages.push({ role: 'system', content: 'mutated' });
    draft.messages.push({ role: 'assistant', content: 'assistant clone check' });

    const toolCallMessage = draft.messages.find(
      (message) => message.role === 'assistant_tool_call',
    ) as Extract<ChatMessage, { role: 'assistant_tool_call' }> | undefined;

    if (toolCallMessage) {
      toolCallMessage.toolCalls.push({
        id: 'call_2',
        name: 'replace_node',
        arguments: '{"blockId":"p2"}',
      });
    }

    return draft;
  }
}

class NullableSystemRootProvider extends BaseSystemRootProvider {
  constructor(
    private readonly messages:
      | Extract<ChatMessage, { role: 'system' }>
      | Array<Extract<ChatMessage, { role: 'system' }>>
      | null,
  ) {
    super();
  }

  protected override buildMessages() {
    return this.messages;
  }
}

class NullableSystemRoleProvider extends BaseSystemRoleProvider {
  constructor(private readonly content: string | null) {
    super();
  }

  protected override buildContent() {
    return this.content;
  }
}

class NullableFirstUserProvider extends BaseFirstUserContentProvider {
  constructor(private readonly messages: ChatMessage | ChatMessage[] | null) {
    super();
  }

  protected override buildMessages() {
    return this.messages;
  }
}

class TrackingEveryUserProvider extends BaseEveryUserContentProvider {
  public readonly calls: Array<{ index: number; isLastUser: boolean; content: string }> = [];

  protected override buildContentForMessage(
    message: Extract<ChatMessage, { role: 'user' }>,
    index: number,
    isLastUser: boolean,
  ) {
    this.calls.push({ index, isLastUser, content: message.content });

    if (!message.metadata?.pageSelections?.length) {
      return null;
    }

    return {
      content: `<user_selections index="${index}">${message.metadata.pageSelections[0].xml}</user_selections>`,
      contextType: 'user_selections',
    };
  }
}

class InspectableLastUserProvider extends BaseLastUserContentProvider {
  constructor(private readonly value: { content: string; contextType: string } | null) {
    super();
  }

  public hasSystemContext(draft: MessageDraft): boolean {
    return this.hasExistingSystemContext(draft);
  }

  public createWrappedContext(content: string, contextType: string): string {
    return this.wrapWithSystemContext(content, contextType);
  }

  public createRawContextBlock(content: string, contextType: string): string {
    return this.createContextBlock(content, contextType);
  }

  protected override buildContent() {
    return this.value;
  }
}

describe('BaseMessageEngineProcessor', () => {
  it('returns the same draft instance when shouldProcess is false', () => {
    const draft = createDraft();
    const context = createContext();

    const nextDraft = new SkipProcessor().process(draft, context);

    expect(nextDraft).toBe(draft);
    expect(nextDraft.systemMessages).toEqual([]);
  });

  it('clones draft state before mutation so original structures remain unchanged', () => {
    const draft: MessageDraft = {
      systemMessages: [{ role: 'system', content: 'original system' }],
      messages: [
        createUserMessage('Primary task'),
        {
          role: 'assistant_tool_call',
          toolCalls: [
            {
              id: 'call_1',
              name: 'insert_node',
              arguments: '{"xml":"<p />"}',
            },
          ],
        },
      ],
    };

    const nextDraft = new CloneCheckProcessor().process(draft, createContext(draft.messages));

    expect(draft.systemMessages).toEqual([{ role: 'system', content: 'original system' }]);
    expect(draft.messages).toHaveLength(2);
    expect(
      (draft.messages[1] as Extract<ChatMessage, { role: 'assistant_tool_call' }>).toolCalls,
    ).toHaveLength(1);

    expect(nextDraft.systemMessages).toHaveLength(2);
    expect(nextDraft.messages).toHaveLength(3);
    expect(
      (nextDraft.messages[1] as Extract<ChatMessage, { role: 'assistant_tool_call' }>).toolCalls,
    ).toHaveLength(2);
  });
});

describe('system providers', () => {
  it('BaseSystemRootProvider normalizes both singular and array system messages', () => {
    const single = new NullableSystemRootProvider({ role: 'system', content: 'Single system' });
    const multiple = new NullableSystemRootProvider([
      { role: 'system', content: 'First system' },
      { role: 'system', content: 'Second system' },
    ]);

    expect(single.process(createDraft(), createContext()).systemMessages).toEqual([
      { role: 'system', content: 'Single system' },
    ]);
    expect(multiple.process(createDraft(), createContext()).systemMessages).toEqual([
      { role: 'system', content: 'First system' },
      { role: 'system', content: 'Second system' },
    ]);
  });

  it('BaseSystemRootProvider preserves draft when buildMessages returns null', () => {
    const draft: MessageDraft = {
      systemMessages: [{ role: 'system', content: 'Existing system' }],
      messages: [createUserMessage('Primary task')],
    };

    const nextDraft = new NullableSystemRootProvider(null).process(draft, createContext());

    expect(nextDraft.systemMessages).toEqual([{ role: 'system', content: 'Existing system' }]);
  });

  it('BaseSystemRoleProvider creates or appends system content and ignores blank values', () => {
    const created = new NullableSystemRoleProvider('  Created system  ').process(
      createDraft(),
      createContext(),
    );
    expect(created.systemMessages).toEqual([{ role: 'system', content: 'Created system' }]);

    const appended = new NullableSystemRoleProvider('  Appended rule  ').process(
      {
        systemMessages: [{ role: 'system', content: 'Base system' }],
        messages: [createUserMessage('Primary task')],
      },
      createContext(),
    );
    expect(appended.systemMessages).toEqual([
      { role: 'system', content: 'Base system\n\nAppended rule' },
    ]);

    const skipped = new NullableSystemRoleProvider('   ').process(
      {
        systemMessages: [{ role: 'system', content: 'Base system' }],
        messages: [createUserMessage('Primary task')],
      },
      createContext(),
    );
    expect(skipped.systemMessages).toEqual([{ role: 'system', content: 'Base system' }]);
  });
});

describe('user content providers', () => {
  it('BaseFirstUserContentProvider inserts one or many messages before the first user message', () => {
    const context = createContext([
      { role: 'assistant', content: 'prior assistant message' },
      createUserMessage('Primary task'),
      createUserMessage('Secondary task'),
    ]);

    const singleInsert = new NullableFirstUserProvider({
      role: 'user',
      content: 'Injected before first user',
    }).process(createDraft(context.messages), context);

    expect(singleInsert.messages.map(chatMessageContent)).toEqual([
      'prior assistant message',
      'Injected before first user',
      'Primary task',
      'Secondary task',
    ]);

    const multiInsert = new NullableFirstUserProvider([
      { role: 'user', content: 'Injected A' },
      { role: 'assistant', content: 'Injected B' },
    ]).process(createDraft(context.messages), context);

    expect(multiInsert.messages.map(chatMessageContent)).toEqual([
      'prior assistant message',
      'Injected A',
      'Injected B',
      'Primary task',
      'Secondary task',
    ]);
  });

  it('BaseFirstUserContentProvider no-ops when there is no user message or no injected content', () => {
    const draftWithoutUser = createDraft([{ role: 'assistant', content: 'assistant only' }]);
    const contextWithoutUser = createContext(draftWithoutUser.messages);

    expect(
      new NullableFirstUserProvider({ role: 'user', content: 'Injected' }).process(
        draftWithoutUser,
        contextWithoutUser,
      ),
    ).toEqual(draftWithoutUser);

    expect(new NullableFirstUserProvider(null).process(createDraft(), createContext())).toEqual(
      createDraft(),
    );
  });

  it('BaseEveryUserContentProvider visits every user and only injects when content is returned', () => {
    const provider = new TrackingEveryUserProvider();
    const draft = createDraft([
      createUserMessage('First task', { pageSelections: [{ xml: '<p id="a">A</p>' }] }),
      { role: 'assistant', content: 'assistant gap' },
      createUserMessage('Second task'),
      createUserMessage('Third task', { pageSelections: [{ xml: '<p id="c">C</p>' }] }),
    ]);

    const nextDraft = provider.process(draft, createContext(draft.messages));

    expect(provider.calls).toEqual([
      { index: 0, isLastUser: false, content: 'First task' },
      { index: 1, isLastUser: false, content: 'Second task' },
      { index: 2, isLastUser: true, content: 'Third task' },
    ]);
    expect((nextDraft.messages[0] as Extract<ChatMessage, { role: 'user' }>).content).toContain(
      '<user_selections index="0"><p id="a">A</p></user_selections>',
    );
    expect((nextDraft.messages[2] as Extract<ChatMessage, { role: 'user' }>).content).toBe(
      'Second task',
    );
    expect((nextDraft.messages[3] as Extract<ChatMessage, { role: 'user' }>).content).toContain(
      '<user_selections index="2"><p id="c">C</p></user_selections>',
    );
  });

  it('BaseLastUserContentProvider injects only the last user message and exposes helper methods', () => {
    const provider = new InspectableLastUserProvider({
      content: '<current_page><doc /></current_page>',
      contextType: 'current_page',
    });
    const draft = createDraft([
      createUserMessage('First task'),
      { role: 'assistant', content: 'assistant gap' },
      createUserMessage('Last task'),
    ]);

    const nextDraft = provider.process(draft, createContext(draft.messages));

    expect((nextDraft.messages[0] as Extract<ChatMessage, { role: 'user' }>).content).toBe(
      'First task',
    );
    expect((nextDraft.messages[2] as Extract<ChatMessage, { role: 'user' }>).content).toContain(
      '<current_page>\n<current_page><doc /></current_page>\n</current_page>',
    );
    expect(provider.hasSystemContext(nextDraft)).toBe(true);
    expect(provider.createRawContextBlock('<doc />', 'current_page')).toBe(
      '<current_page>\n<doc />\n</current_page>',
    );
    expect(provider.createWrappedContext('<doc />', 'current_page')).toContain(CONTEXT_INSTRUCTION);
    expect(provider.createWrappedContext('<doc />', 'current_page')).toContain(
      SYSTEM_CONTEXT_START,
    );
    expect(provider.createWrappedContext('<doc />', 'current_page')).toContain(SYSTEM_CONTEXT_END);
  });

  it('BaseLastUserContentProvider no-ops when there is no user message or no content', () => {
    const emptyProvider = new InspectableLastUserProvider(null);
    expect(emptyProvider.process(createDraft(), createContext())).toEqual(createDraft());

    const noUserDraft = createDraft([{ role: 'assistant', content: 'assistant only' }]);
    expect(
      new InspectableLastUserProvider({
        content: '<current_page><doc /></current_page>',
        contextType: 'current_page',
      }).process(noUserDraft, createContext(noUserDraft.messages)),
    ).toEqual(noUserDraft);
  });
});
