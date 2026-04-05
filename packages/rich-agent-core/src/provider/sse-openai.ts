import type { LLMChunk } from '../protocol';

type PendingToolCall = {
  id: string;
  name: string;
  arguments: string;
  yielded: boolean;
};

export async function* parseOpenAISSE(response: Response): AsyncIterable<LLMChunk> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const pendingToolCalls = new Map<number, PendingToolCall>();

  // Detect whether a streamed JSON arguments string is structurally complete.
  // Relying on JSON.parse alone is unsafe: empty string coerced to "{}" would
  // parse successfully and cause tool_calls to fire with empty params before
  // their real arguments have streamed in. Track brace/bracket depth with
  // string-state awareness so we only yield once the top-level value closes.
  function isBalanced(s: string): boolean {
    if (!s) return false;
    let depth = 0;
    let inString = false;
    let escape = false;
    let sawOpen = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (c === '{' || c === '[') {
        depth++;
        sawOpen = true;
      } else if (c === '}' || c === ']') {
        depth--;
        if (sawOpen && depth === 0) return true;
      }
    }
    return false;
  }

  function tryYieldReady(): LLMChunk[] {
    const ready: LLMChunk[] = [];
    for (const tc of pendingToolCalls.values()) {
      if (tc.yielded) continue;
      if (!tc.id || !tc.name) continue;
      if (!isBalanced(tc.arguments)) continue;
      // Final sanity parse; if it throws we keep accumulating.
      try {
        JSON.parse(tc.arguments);
      } catch {
        continue;
      }
      tc.yielded = true;
      ready.push({
        type: 'tool_call',
        id: tc.id,
        name: tc.name,
        arguments: tc.arguments,
      });
    }
    return ready;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          for (const tc of pendingToolCalls.values()) {
            if (tc.yielded) continue;
            yield {
              type: 'tool_call',
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments,
            };
          }
          pendingToolCalls.clear();
          yield { type: 'done' };
          return;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }

        const delta = parsed.choices?.[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          yield { type: 'text', text: delta.content };
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!pendingToolCalls.has(idx)) {
              pendingToolCalls.set(idx, {
                id: tc.id || '',
                name: tc.function?.name || '',
                arguments: '',
                yielded: false,
              });
            }
            const pending = pendingToolCalls.get(idx)!;
            if (tc.id) pending.id = tc.id;
            if (tc.function?.name) pending.name = tc.function.name;
            if (tc.function?.arguments) pending.arguments += tc.function.arguments;
          }

          for (const ready of tryYieldReady()) yield ready;
        }

        const finishReason = parsed.choices?.[0]?.finish_reason;
        if (finishReason === 'tool_calls') {
          for (const tc of pendingToolCalls.values()) {
            if (tc.yielded) continue;
            yield {
              type: 'tool_call',
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments,
            };
            tc.yielded = true;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: 'done' };
}
