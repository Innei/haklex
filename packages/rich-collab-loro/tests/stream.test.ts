import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import { $getNodeByKey, $getRoot } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $reconcileRoot, createLoroBinding, planFrames, streamAtVersion } from '../src';
import { createEditor, createPeer, rootJSON, sync } from './helpers';

const registry = createDefaultRegistry();
const parse = (body: string) => deserializeFromXml(`<doc>${body}</doc>`, registry);

const texts = (root: { children?: Array<{ children?: Array<{ text?: string }> }> }) =>
  (root.children ?? []).map((block) =>
    (block.children ?? []).map((run) => run.text ?? '').join(''),
  );

describe('planFrames', () => {
  it('types an inserted paragraph in growing chunks and ends on the target', () => {
    const base = parse('<p>keep</p>').root;
    const target = parse(`<p>keep</p><p>${'a'.repeat(60)}</p>`).root;
    const frames = planFrames(base as never, target as never);
    expect(frames.length).toBeGreaterThan(5);
    const lengths = frames.map((frame) => texts(frame.root as never)[1]?.length ?? 0);
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    expect(frames.at(-1)!.root).toEqual(target);
    expect(frames[2]!.focus).toEqual({ path: [1], offset: lengths[2] });
  });

  it('types only the changed middle of an edited paragraph', () => {
    const base = parse('<p>hello world</p>').root;
    const target = parse('<p>hello brave new world</p>').root;
    const frames = planFrames(base as never, target as never);
    for (const frame of frames) {
      const [text] = texts(frame.root as never);
      expect(text!.startsWith('hello ')).toBe(true);
      expect(text!.endsWith('world')).toBe(true);
    }
  });

  it('inserts a non-text block in a single frame', () => {
    const base = parse('<p>a</p>').root;
    const target = parse('<p>a</p><mermaid>graph LR\n A --> B</mermaid>').root;
    const frames = planFrames(base as never, target as never);
    expect(frames).toHaveLength(1);
    expect(frames[0]!.focus).toEqual({ path: [1], offset: 0 });
  });
});

describe('streamAtVersion', () => {
  it('reaches the same state as editAtVersion and keeps concurrent human text', () => {
    const server = createPeer(1);
    server.editor.update(() => $reconcileRoot(parse('<p>alpha</p><p>beta</p>').root), {
      discrete: true,
    });
    const base = server.doc.frontiers();
    const baseState = parse('<p>alpha</p><p>beta</p>');
    const human = createPeer(2, server);
    human.editor.update(
      () => {
        const first = $getRoot().getFirstChild()!;
        (
          first.getFirstChild() as unknown as { setTextContent: (t: string) => void }
        ).setTextContent('alpha by human');
      },
      { discrete: true },
    );
    sync(server, human);
    const target = parse('<p>alpha</p><p>beta rewritten by the agent, streamed</p>');

    const { frontiers, steps } = streamAtVersion(
      server.doc,
      base,
      createEditor,
      baseState,
      target,
      'agent',
    );
    expect(steps.length).toBeGreaterThan(3);
    for (const step of steps) {
      server.binding.import(step.update);
      if (step.cursor) {
        const key = server.binding.keyOf(step.cursor.id);
        expect(key).toBeDefined();
        const size = server.editor
          .getEditorState()
          .read(() => $getNodeByKey(key!)!.getTextContentSize());
        expect(step.cursor.offset).toBeLessThanOrEqual(size);
      }
    }
    sync(server, human);

    const oneShot = createPeer(4, server);
    expect(texts(rootJSON(server) as never)).toEqual([
      'alpha by human',
      'beta rewritten by the agent, streamed',
    ]);
    expect(rootJSON(human)).toEqual(rootJSON(server));
    expect(rootJSON(oneShot)).toEqual(rootJSON(server));

    const atAgentVersion = createEditor();
    createLoroBinding(atAgentVersion, server.doc.forkAt(frontiers));
    expect(texts(atAgentVersion.getEditorState().toJSON().root as never)).toEqual([
      'alpha',
      'beta rewritten by the agent, streamed',
    ]);
  });
});
