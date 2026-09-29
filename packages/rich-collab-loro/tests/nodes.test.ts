import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import { describe, expect, it } from 'vitest';

import { createPeer, rootJSON } from './helpers';

const FIXTURE = `<doc>
<h2 id="h1">Title</h2>
<p id="p1">normal <b>bold</b> <i>italic</i> <a href="https://x.test">link</a> <code>inline</code></p>
<blockquote id="q1" attribution="— Wang Xizhi">quoted</blockquote>
<blockquote id="q2" rich="true" attribution="Ada"><p>hi</p></blockquote>
<ul id="u1"><li id="l1">A</li><li id="l2">B</li></ul>
<codeblock id="c1" lang="ts">const x = 1</codeblock>
<hr id="hr1" />
<img id="i1" src="/a.jpg" alt="Photo" width="800" />
<details id="d1" summary="Click" open="true"><p>content</p></details>
<alert id="aq1" type="warning"><p>Be careful</p></alert>
<banner id="b1" type="tip"><p>Tip content</p></banner>
<math id="kb1" display="block">E=mc^2</math>
<mermaid id="m1">graph LR</mermaid>
<excalidraw id="ex1"><![CDATA[{"elements":[]}]]></excalidraw>
<embed id="e1" url="https://youtube.com/123" source="youtube" />
<link-card id="lc1" url="https://example.com" title="Ex" />
<gallery id="g1" layout="grid"><img src="/a.jpg" alt="A" /><img src="/b.jpg" alt="B" /></gallery>
<grid id="g2" cols="2" gap="16px"><cell><p>A</p></cell><cell><p>B</p></cell></grid>
<dynamic id="dyn1" url="https://cdn.example.com/widget.mjs" initial-height="480"><![CDATA[{"level":1}]]></dynamic>
<code-snippet id="cs1"><file name="index.ts" lang="ts">export {}</file></code-snippet>
<footnote-section id="fs1"><def ref="1">Note one</def></footnote-section>
</doc>`;

function collectTypes(node: unknown, out: Set<string>): Set<string> {
  const record = node as { children?: unknown[]; type: string };
  out.add(record.type);
  for (const child of record.children ?? []) collectTypes(child, out);
  return out;
}

describe('generic node mapping', () => {
  it('round-trips every haklex node in the fixture through Loro', () => {
    const state = deserializeFromXml(FIXTURE, createDefaultRegistry());
    const a = createPeer(1);
    a.editor.setEditorState(a.editor.parseEditorState(state), { tag: 'test' } as never);
    a.editor.update(() => {}, { discrete: true });
    const types = collectTypes(rootJSON(a), new Set());
    expect(types.size).toBeGreaterThan(15);
    const b = createPeer(2, a);
    expect(rootJSON(b)).toEqual(rootJSON(a));
  });
});
