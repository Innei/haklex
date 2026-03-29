import type { ChatMessage, LLMChunk, LLMProvider, ToolSchema } from '@haklex/rich-agent-core';

interface ProviderOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function createClaudeProvider({ model, apiKey, baseUrl }: ProviderOptions): LLMProvider {
  return {
    async *chat(messages: ChatMessage[], tools?: ToolSchema[]): AsyncIterable<LLMChunk> {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-base-url': baseUrl,
          'x-provider-type': 'claude',
        },
        body: JSON.stringify({ provider: 'claude', model, messages, tools }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude API error (${res.status}): ${err}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let currentToolBlock: { id: string; name: string; arguments: string } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (!data) continue;

          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          const eventType = currentEvent || parsed.type;

          if (eventType === 'content_block_start') {
            if (parsed.content_block?.type === 'tool_use') {
              currentToolBlock = {
                id: parsed.content_block.id,
                name: parsed.content_block.name,
                arguments: '',
              };
            }
          } else if (eventType === 'content_block_delta') {
            const delta = parsed.delta;
            if (delta?.type === 'text_delta') {
              yield { type: 'text', text: delta.text };
            } else if (delta?.type === 'thinking_delta') {
              yield { type: 'thinking', text: delta.thinking };
            } else if (delta?.type === 'input_json_delta' && currentToolBlock) {
              currentToolBlock.arguments += delta.partial_json;
            }
          } else if (eventType === 'content_block_stop') {
            if (currentToolBlock) {
              yield {
                type: 'tool_call',
                id: currentToolBlock.id,
                name: currentToolBlock.name,
                arguments: currentToolBlock.arguments,
              };
              currentToolBlock = null;
            }
          } else if (eventType === 'message_stop') {
            yield { type: 'done' };
          }

          currentEvent = '';
        }
      }

      yield { type: 'done' };
    },
  };
}
