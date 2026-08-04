// @vitest-environment happy-dom
import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { GalleryEditNode } from '../src/GalleryEditNode';
import { $createGalleryNode, GalleryNode } from '../src/GalleryNode';

vi.mock('@haklex/rich-editor/renderers', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/GalleryEditRenderer', () => ({
  GalleryEditRenderer: () => null,
}));

function createTestEditor() {
  return createEditor({
    namespace: 'GalleryNodeTest',
    nodes: [GalleryNode],
    onError: (error) => {
      throw error;
    },
  });
}

function createEditTestEditor() {
  return createEditor({
    namespace: 'GalleryEditNodeTest',
    nodes: [GalleryEditNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('GalleryNode height-control fields', () => {
  it('defaults to aspect "auto", fit "cover", and maxItemHeight undefined', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createGalleryNode({ images: [] });
      expect(node.getAspect()).toBe('auto');
      expect(node.getFit()).toBe('cover');
      expect(node.getMaxItemHeight()).toBeUndefined();
    });
  });

  it('round-trips aspect, fit, and maxItemHeight through exportJSON/importJSON', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createGalleryNode({
        images: [{ src: 'https://example.com/a.png' }],
        layout: 'grid',
        aspect: '16:9',
        fit: 'contain',
        maxItemHeight: 320,
      });
      const restored = GalleryNode.importJSON(node.exportJSON());
      expect(restored.getAspect()).toBe('16:9');
      expect(restored.getFit()).toBe('contain');
      expect(restored.getMaxItemHeight()).toBe(320);
    });
  });

  it('omits maxItemHeight from exportJSON when unset', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createGalleryNode({ images: [] });
      const json = node.exportJSON();
      expect('maxItemHeight' in json).toBe(false);
      expect(json.aspect).toBe('auto');
      expect(json.fit).toBe('cover');
    });
  });

  it("imports a legacy serialized gallery (images + layout only) with today's defaults", () => {
    const editor = createTestEditor();
    editor.update(() => {
      const legacy = {
        type: 'gallery',
        version: 1,
        images: [{ src: 'https://example.com/a.png' }],
        layout: 'masonry',
      };
      const restored = GalleryNode.importJSON(legacy as never);
      expect(restored.getAspect()).toBe('auto');
      expect(restored.getFit()).toBe('cover');
      expect(restored.getMaxItemHeight()).toBeUndefined();
      expect(restored.getLayout()).toBe('masonry');
    });
  });

  it('preserves aspect, fit, and maxItemHeight across clone()', () => {
    const editor = createTestEditor();
    editor.update(() => {
      const node = $createGalleryNode({
        images: [{ src: 'https://example.com/a.png' }],
        aspect: '4:3',
        fit: 'contain',
        maxItemHeight: 240,
      });
      const cloned = GalleryNode.clone(node);
      expect(cloned.getAspect()).toBe('4:3');
      expect(cloned.getFit()).toBe('contain');
      expect(cloned.getMaxItemHeight()).toBe(240);
    });
  });
});

describe('GalleryEditNode height-control fields', () => {
  it('preserves aspect, fit, and maxItemHeight across clone()', () => {
    const editor = createEditTestEditor();
    editor.update(() => {
      const node = new GalleryEditNode({
        images: [{ src: 'https://example.com/a.png' }],
        aspect: '1:1',
        fit: 'contain',
        maxItemHeight: 180,
      });
      const cloned = GalleryEditNode.clone(node);
      expect(cloned.getAspect()).toBe('1:1');
      expect(cloned.getFit()).toBe('contain');
      expect(cloned.getMaxItemHeight()).toBe(180);
    });
  });

  it('round-trips aspect, fit, and maxItemHeight through exportJSON/importJSON', () => {
    const editor = createEditTestEditor();
    editor.update(() => {
      const node = new GalleryEditNode({
        images: [{ src: 'https://example.com/a.png' }],
        aspect: '3:4',
        fit: 'cover',
        maxItemHeight: 400,
      });
      const restored = GalleryEditNode.importJSON(node.exportJSON());
      expect(restored.getAspect()).toBe('3:4');
      expect(restored.getFit()).toBe('cover');
      expect(restored.getMaxItemHeight()).toBe(400);
    });
  });

  it("imports a legacy serialized gallery (images + layout only) with today's defaults", () => {
    const editor = createEditTestEditor();
    editor.update(() => {
      const legacy = {
        type: 'gallery',
        version: 1,
        images: [{ src: 'https://example.com/a.png' }],
        layout: 'carousel',
      };
      const restored = GalleryEditNode.importJSON(legacy as never);
      expect(restored.getAspect()).toBe('auto');
      expect(restored.getFit()).toBe('cover');
      expect(restored.getMaxItemHeight()).toBeUndefined();
      expect(restored.getLayout()).toBe('carousel');
    });
  });
});
