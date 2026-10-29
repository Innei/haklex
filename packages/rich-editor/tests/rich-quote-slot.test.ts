// @vitest-environment happy-dom
import { QuoteNode } from '@lexical/rich-text';
import { $createTextNode, $getRoot, createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $createRichQuoteNode, RichQuoteNode } from '../src/nodes/RichQuoteNode';

function mountEditor() {
  const editor = createEditor({
    namespace: 'RichQuoteSlotTest',
    nodes: [QuoteNode, RichQuoteNode, { replace: QuoteNode, with: () => new RichQuoteNode() }],
    onError: (error) => {
      throw error;
    },
  });
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.append(root);
  editor.setRootElement(root);
  return { editor, root };
}

describe('RichQuoteNode attribution slot', () => {
  it('keeps a non-editable attribution slot after the quote text', () => {
    const { editor, root } = mountEditor();
    editor.update(
      () => {
        const quote = $createRichQuoteNode('Author, Work');
        quote.append($createTextNode('The best code is no code at all.'));
        $getRoot().append(quote);
      },
      { discrete: true },
    );
    const blockquote = root.querySelector('blockquote')!;
    const slot = blockquote.lastElementChild as HTMLElement;
    expect(slot.hasAttribute('data-quote-attribution-slot')).toBe(true);
    expect(slot.contentEditable).toBe('false');
    expect(blockquote.firstElementChild?.textContent).toBe('The best code is no code at all.');
    root.remove();
  });

  it('keeps the slot last when text is appended later', () => {
    const { editor, root } = mountEditor();
    editor.update(
      () => {
        $getRoot().append($createRichQuoteNode().append($createTextNode('One')));
      },
      { discrete: true },
    );
    editor.update(
      () => {
        const quote = $getRoot().getFirstChild() as RichQuoteNode;
        quote.append($createTextNode(' two'));
      },
      { discrete: true },
    );
    const blockquote = root.querySelector('blockquote')!;
    expect(blockquote.lastElementChild?.hasAttribute('data-quote-attribution-slot')).toBe(true);
    expect(blockquote.textContent).toBe('One two');
    root.remove();
  });

  it('exports the attribution as a footer and no editing slot', () => {
    const { editor, root } = mountEditor();
    let html = '';
    editor.update(
      () => {
        const quote = $createRichQuoteNode('Author, Work');
        quote.append($createTextNode('Quote'));
        $getRoot().append(quote);
        const { after, element } = quote.exportDOM(editor);
        const finished = after ? after(element as HTMLElement) : element;
        html = (finished as HTMLElement).outerHTML;
      },
      { discrete: true },
    );
    expect(html).not.toContain('data-quote-attribution-slot');
    expect(html).toContain('<footer');
    expect(html).toContain('— Author, Work');
    root.remove();
  });
});
