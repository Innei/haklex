import { ChatPanel } from '@haklex/rich-agent-chat';
import type { LLMChunk, LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore } from '@haklex/rich-agent-core';
import { AgentPanelPlugin, builtInActions, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import { MentionPlatformProvider, ShiroEditor } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useMemo, useRef } from 'react';

const initialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        children: [
          {
            type: 'text',
            text: 'AI Agent Demo',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        tag: 'h1',
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'This is a demo of the AI agent extension. The agent can insert, replace, and delete blocks in the document via tool calling.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Try typing a message in the chat panel to interact with the agent. The agent will propose changes as inline diffs that you can accept or reject.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} as any;

function createMockProvider(): LLMProvider {
  return {
    async *chat(messages: any[], _tools?: any[]): AsyncIterable<LLMChunk> {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      const content = lastUserMsg && 'content' in lastUserMsg ? lastUserMsg.content : '';

      await new Promise((r) => setTimeout(r, 300));

      if (content.toLowerCase().includes('delete')) {
        yield {
          type: 'tool_call',
          id: 'tc-1',
          name: 'search_document',
          arguments: JSON.stringify({ query: '' }),
        };
        yield { type: 'done' };
        return;
      }

      if (content.toLowerCase().includes('insert')) {
        yield {
          type: 'tool_call',
          id: 'tc-1',
          name: 'insert_node',
          arguments: JSON.stringify({
            position: { type: 'root', index: 0 },
            node: {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'This paragraph was inserted by the AI agent.',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              textFormat: 0,
              textStyle: '',
            },
          }),
        };
        yield { type: 'done' };

        await new Promise((r) => setTimeout(r, 200));
        yield { type: 'text', text: 'Inserted a new paragraph at the top of the document.' };
        yield { type: 'done' };
        return;
      }

      const response = `I received your message: "${content}". I can help you edit the document. Try saying "insert a paragraph" or "delete" to see tool calling in action.`;
      for (const word of response.split(' ')) {
        yield { type: 'text', text: `${word} ` };
        await new Promise((r) => setTimeout(r, 30));
      }
      yield { type: 'done' };
    },
  };
}

function AgentEditorWithChat({
  provider,
  store,
}: {
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);

  const handleSend = useCallback(
    (message: string) => {
      const loop = agentLoopRef.current;
      if (!loop) return;
      loop.run(builtInActions[1], message).catch((err: unknown) => {
        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'error', message: String(err) },
        });
      });
    },
    [store],
  );

  return (
    <div className="agent-split">
      <div className="agent-pane-editor">
        <MentionPlatformProvider platforms={{}}>
          <ShiroEditor header={<ToolbarPlugin />} initialValue={initialContent}>
            <AgentPanelPlugin provider={provider} store={store} />
            <AgentLoopCapture loopRef={agentLoopRef} provider={provider} store={store} />
          </ShiroEditor>
        </MentionPlatformProvider>
      </div>
      <div className="agent-pane-chat">
        <ChatPanel store={store} onSend={handleSend} />
      </div>
    </div>
  );
}

function AgentLoopCapture({
  loopRef,
  provider,
  store,
}: {
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const loop = useAgentLoop({ provider, store });
  loopRef.current = loop;
  return null;
}

export function AgentPage() {
  const store = useMemo(() => createAgentStore(), []);
  const provider = useMemo(() => createMockProvider(), []);

  return <AgentEditorWithChat provider={provider} store={store} />;
}
