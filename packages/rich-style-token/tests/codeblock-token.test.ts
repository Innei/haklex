import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('code block surface', () => {
  it('reads --rc-code-bg so hosts that remap it still reach code blocks', () => {
    const source = readFileSync(
      path.join(__dirname, '../../rich-renderer-codeblock/src/styles.css.ts'),
      'utf8',
    );
    expect(source).toContain('vars.color.codeBg');
    expect(source).not.toContain('vars.color.bgSecondary');
  });
});

describe('compact copy button', () => {
  it('sits on an opaque surface because it overlays the code', () => {
    const source = readFileSync(
      path.join(__dirname, '../../rich-editor-ui/src/components/code-block/styles.css.ts'),
      'utf8',
    );
    const copyRule = source.slice(source.indexOf('export const copyButton'));
    const compactRule = copyRule.slice(copyRule.indexOf('[data-chrome="compact"] &'));
    expect(compactRule.slice(0, 200)).toMatch(
      /linear-gradient\(\$\{vars\.color\.fill\}.*\$\{vars\.color\.codeBg\}/,
    );
  });
});
