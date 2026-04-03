import type { ChatMessage, ToolSchema } from '../protocol';
import { buildClaudeBody, buildOpenAIBody } from './message-format';

export type TransportAdapter = (
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
  signal: AbortSignal,
) => Promise<Response>;

export type ProviderType = 'claude' | 'openai-compatible';

export function createDirectTransport(config: {
  apiKey: string;
  baseUrl: string;
  providerType: ProviderType;
}): TransportAdapter {
  const { apiKey, baseUrl, providerType } = config;

  return async (messages, tools, model, signal) => {
    if (providerType === 'claude') {
      const body = buildClaudeBody(messages, tools, model);
      return fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'interleaved-thinking-2025-05-14',
        },
        body: JSON.stringify(body),
        signal,
      });
    }

    const body = buildOpenAIBody(messages, tools, model);
    return fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  };
}

export function createProxyTransport(config: {
  endpoint: string;
  headers?: Record<string, string>;
}): TransportAdapter {
  const { endpoint, headers: extraHeaders } = config;

  return async (messages, tools, model, signal) => {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, tools }),
      signal,
    });
  };
}
