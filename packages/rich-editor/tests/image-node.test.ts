// @vitest-environment happy-dom
import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { $createImageNode, ImageNode } from '../src/nodes/ImageNode';

vi.mock('../src/components/RendererWrapper', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/components/renderers/ImageRenderer', () => ({
  ImageRenderer: vi.fn(),
}));

function createTestEditor() {
  return createEditor({
    namespace: 'ImageNodeTest',
    nodes: [ImageNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('ImageNode displayWidth/layout serialization', () => {
  it('omits displayWidth and layout from exportJSON when unset', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({ src: 'https://example.com/a.png', altText: 'a' });
      const json = node.exportJSON();
      expect(json.displayWidth).toBeUndefined();
      expect(json.layout).toBeUndefined();
      expect(json.version).toBe(1);
    });
  });

  it('includes displayWidth and layout in exportJSON when set', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({ src: 'https://example.com/a.png', altText: 'a' });
      node.setDisplayWidth(40);
      node.setLayout('float-left');
      const json = node.exportJSON();
      expect(json.displayWidth).toBe(40);
      expect(json.layout).toBe('float-left');
    });
  });

  it('restores displayWidth and layout through importJSON', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        displayWidth: 55,
        layout: 'align-right',
      });
      const restored = ImageNode.importJSON(node.exportJSON());
      expect(restored.getDisplayWidth()).toBe(55);
      expect(restored.getLayout()).toBe('align-right');
    });
  });

  it('drops an invalid layout string from importJSON', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({ src: 'https://example.com/a.png', altText: 'a' });
      const json = { ...node.exportJSON(), layout: 'banana' };
      const restored = ImageNode.importJSON(json as never);
      expect(restored.getLayout()).toBeUndefined();
    });
  });

  it('preserves displayWidth and layout across clone', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        displayWidth: 30,
        layout: 'float-right',
      });
      const cloned = ImageNode.clone(node);
      expect(cloned.getDisplayWidth()).toBe(30);
      expect(cloned.getLayout()).toBe('float-right');
    });
  });
});

describe('ImageNode setDisplayWidth clamping', () => {
  it('clamps, rounds, and rejects invalid values', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({ src: 'https://example.com/a.png', altText: 'a' });

      node.setDisplayWidth(5);
      expect(node.getDisplayWidth()).toBe(10);

      node.setDisplayWidth(150);
      expect(node.getDisplayWidth()).toBe(100);

      node.setDisplayWidth(33.7);
      expect(node.getDisplayWidth()).toBe(34);

      node.setDisplayWidth(Number.NaN);
      expect(node.getDisplayWidth()).toBeUndefined();

      node.setDisplayWidth(50);
      expect(node.getDisplayWidth()).toBe(50);

      node.setDisplayWidth();
      expect(node.getDisplayWidth()).toBeUndefined();
    });
  });
});

describe('ImageNode layout DOM', () => {
  it('sets data-layout and float width on createDOM', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        displayWidth: 40,
        layout: 'float-left',
      });
      const dom = node.createDOM({} as never);
      expect(dom.dataset.layout).toBe('float-left');
      expect(dom.style.width).toBe('40%');
    });
  });

  it('sets data-layout but no width for float layout without displayWidth', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        layout: 'float-left',
      });
      const dom = node.createDOM({} as never);
      expect(dom.dataset.layout).toBe('float-left');
      expect(dom.style.width).toBe('');
    });
  });

  it('does not set width on the wrapper for non-float layouts', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        displayWidth: 40,
        layout: 'align-left',
      });
      const dom = node.createDOM({} as never);
      expect(dom.dataset.layout).toBe('align-left');
      expect(dom.style.width).toBe('');
    });
  });

  it('updates the existing DOM element when layout changes', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const prev = $createImageNode({ src: 'https://example.com/a.png', altText: 'a' });
      const next = $createImageNode({
        src: 'https://example.com/a.png',
        altText: 'a',
        displayWidth: 60,
        layout: 'float-right',
      });
      const dom = prev.createDOM({} as never);
      expect(dom.dataset.layout).toBeUndefined();

      const result = next.updateDOM(prev as never, dom);
      expect(result).toBe(false);
      expect(dom.dataset.layout).toBe('float-right');
      expect(dom.style.width).toBe('60%');

      prev.updateDOM(next as never, dom);
      expect(dom.dataset.layout).toBeUndefined();
      expect(dom.style.width).toBe('');
    });
  });
});

describe('ImageNode nested-editor slash menu availability', () => {
  it('allows Image in nested editors', () => {
    expect(ImageNode.commandItems[0].nested).toBeUndefined();
  });
});
