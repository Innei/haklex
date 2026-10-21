import { isSupportedLanguage } from '@pierre/highlights';
import { describe, expect, it } from 'vitest';

import { highlightCode, loadHighlighter } from '../src/components/code-block/highlight';
import { codeLanguages } from '../src/components/code-block/languages';
import { streamdownCodePlugin } from '../src/components/code-block/streamdown-plugin';

describe('codeLanguages', () => {
  it('lists only languages the highlighter can lex, once each', () => {
    const ids = codeLanguages.map((language) => language.id);
    expect(ids.filter((id) => !isSupportedLanguage(id))).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('highlightCode', () => {
  it('renders dual-theme lines that the card styles target', async () => {
    const html = await highlightCode('const a = 1\nconst b = 2', 'ts');
    expect(html).toMatch(/^<pre class="highlights highlights-themes" style="background-color:/);
    expect(html.match(/<span class="line">/g)).toHaveLength(2);
    expect(html).toContain('--hls-dark:');
  });

  it('renders a single theme without dark variables', async () => {
    const html = await highlightCode('const a = 1', 'ts', 'dark');
    expect(html).toMatch(
      /^<pre class="highlights" style="background-color:#24292e;color:#e1e4e8">/,
    );
    expect(html).not.toContain('--hls-dark');
  });

  it.each(['shellscript', 'objective-c', 'plaintext', 'ini', 'nope'])(
    'accepts the stored %s language id',
    async (language) => {
      await expect(highlightCode('a = 1', language)).resolves.toContain('<span class="line">');
    },
  );

  it('escapes markup', async () => {
    const html = await highlightCode('<b>&</b>', 'text');
    expect(html).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
  });
});

describe('streamdownCodePlugin', () => {
  it('returns Shiki-compatible tokens with the variables Streamdown reads', async () => {
    await loadHighlighter();
    const result = streamdownCodePlugin.highlight({ code: 'const a = 1', language: 'ts' });
    expect(result?.tokens[0].map((token) => token.content).join('')).toBe('const a = 1');
    expect(result?.tokens[0][0].htmlStyle).toHaveProperty('--shiki-dark');
    expect(result?.bg).toContain('--shiki-dark-bg');
  });
});
