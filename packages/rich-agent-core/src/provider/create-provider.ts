import type { LLMChunk, LLMProvider } from '../protocol';
import { parseClaudeSSE } from './sse-claude';
import { parseOpenAISSE } from './sse-openai';
import type { ProviderType, TransportAdapter } from './transport';

export function createProvider(config: {
  model: string;
  providerType: ProviderType;
  transport: TransportAdapter;
}): LLMProvider {
  const { model, transport, providerType } = config;
  const parse = providerType === 'claude' ? parseClaudeSSE : parseOpenAISSE;

  return {
    async *chat(messages, tools): AsyncIterable<LLMChunk> {
      const controller = new AbortController();
      const response = await transport(messages, tools, model, controller.signal);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`LLM API error (${response.status}): ${err}`);
      }

      yield* parse(response);
    },
  };
}
