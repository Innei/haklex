import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  createEditor,
  HISTORY_MERGE_TAG,
  type LexicalEditor,
  type NodeKey,
  ParagraphNode,
  SKIP_DOM_SELECTION_TAG,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { registerNestedEditorSync } from '../src/index';

function setup() {
  const parent = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  let ownerKey: NodeKey = '';
  parent.update(
    () => {
      const owner = $createParagraphNode();
      $getRoot().append(owner);
      ownerKey = owner.getKey();
    },
    { discrete: true },
  );
  const nested = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  nested.update(() => $getRoot().append($createParagraphNode()), { discrete: true });
  const parentUpdates: Array<{ dirty: boolean; tags: Set<string> }> = [];
  parent.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
    parentUpdates.push({ dirty: dirtyElements.has(ownerKey) || dirtyLeaves.has(ownerKey), tags });
  });
  return { nested, ownerKey, parent, parentUpdates };
}

async function type(nested: LexicalEditor, text: string) {
  nested.update(
    () => {
      ($getRoot().getFirstChildOrThrow() as ParagraphNode).append($createTextNode(text));
    },
    { discrete: true },
  );
  await Promise.resolve();
}

describe('registerNestedEditorSync', () => {
  it('marks the owner node dirty in the parent when nested content changes', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);

    await type(nested, 'hello');

    expect(parentUpdates.some((update) => update.dirty)).toBe(true);
  });

  it('merges the parent update into the current history entry', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);

    await type(nested, 'hello');

    expect(parentUpdates.at(-1)?.tags.has(HISTORY_MERGE_TAG)).toBe(true);
  });

  it('leaves the DOM selection to the nested editor', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);

    await type(nested, 'hello');

    expect(parentUpdates.at(-1)?.tags.has(SKIP_DOM_SELECTION_TAG)).toBe(true);
  });

  it('ignores nested updates that change no nodes', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);

    nested.update(() => $setSelection(null), { discrete: true });
    await Promise.resolve();

    expect(parentUpdates).toEqual([]);
  });

  it('ignores updates that leave the content unchanged', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);

    nested.registerNodeTransform(ParagraphNode, () => {});
    await Promise.resolve();
    await Promise.resolve();

    expect(parentUpdates).toEqual([]);
  });

  it('stops after unregister', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    const unregister = registerNestedEditorSync(parent, nested, ownerKey);
    unregister();

    await type(nested, 'hello');

    expect(parentUpdates).toEqual([]);
  });

  it('does nothing once the owner node is gone', async () => {
    const { nested, ownerKey, parent, parentUpdates } = setup();
    registerNestedEditorSync(parent, nested, ownerKey);
    parent.update(() => $getRoot().clear(), { discrete: true });
    parentUpdates.length = 0;

    await expect(type(nested, 'hello')).resolves.toBeUndefined();
    expect(parentUpdates.some((update) => update.dirty)).toBe(false);
  });
});
