export const liteXmlPasteSample = `<doc>
<h2>LiteXML Paste Coverage</h2>
<p>This paragraph covers <b>bold</b>, <i>italic</i>, <u>underline</u>, <s>strike</s>, <code>inline code</code>, <a href="https://example.com">link</a>, <math>E=mc^2</math>, <mention platform="github" handle="innei">Innei</mention>, <tag>demo</tag>, <comment>inline comment</comment>, <ruby rt="haklex">Haklex</ruby>, <spoiler>hidden text</spoiler>, and a footnote<footnote ref="1" />.</p>
<blockquote><p>Blockquote imported from LiteXML.</p></blockquote>
<ul>
  <li><p>Bullet item</p></li>
  <li><p>Second bullet item</p></li>
</ul>
<ol>
  <li><p>Ordered item</p></li>
  <li><p>Second ordered item</p></li>
</ol>
<ul type="check">
  <li checked="true"><p>Checked task</p></li>
  <li checked="false"><p>Open task</p></li>
</ul>
<table>
  <tr><th><p>Node</p></th><th><p>Status</p></th></tr>
  <tr><td><p>LiteXML</p></td><td><p>Imported</p></td></tr>
</table>
<hr />
<img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200" alt="Landscape" caption="Image node" />
<video src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" poster="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.jpg" />
<link-card url="https://github.com/Innei/haklex" title="Haklex repository" description="Rich editor ecosystem" />
<embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" source="youtube" />
<codeblock lang="ts">const imported = "codeblock";</codeblock>
<mermaid>flowchart LR
  A[LiteXML] --> B[Lexical]</mermaid>
<math display="block">\\int_0^1 x^2 dx = \\frac{1}{3}</math>
<alert type="warning"><p>Alert quote imported from XML.</p></alert>
<banner type="tip"><p>Banner imported from XML.</p></banner>
<nested-doc><p>Nested document body.</p></nested-doc>
<details summary="Imported details" open="true"><p>Details body.</p></details>
<gallery layout="grid"><img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=900" alt="Forest" /><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900" alt="Desert" /></gallery>
<excalidraw><![CDATA[{"elements":[]}]]></excalidraw>
<grid cols="2" gap="16px"><cell><p>Grid cell A</p></cell><cell><p>Grid cell B</p></cell></grid>
<agent-diff op="insert" entry="demo-diff-entry" />
<code-snippet><file name="index.ts" lang="ts">export const answer = 42;</file><file name="usage.ts" lang="ts">console.log(answer);</file></code-snippet>
<chat variant="user-agent"><participants><participant id="u1" kind="user" name="User" /><participant id="a1" kind="agent" name="Assistant" /></participants><messages><message id="m1" participant="u1">Can LiteXML create custom nodes?</message><message id="m2" participant="a1">Yes. Paste imports route through the default registry.</message></messages></chat>
<poll mode="multiple" show-results="after-vote"><question>Which nodes imported correctly?</question><option>Inline nodes</option><option>Block nodes</option><option>Extension nodes</option></poll>
<footnote-section><def ref="1">Footnote definition imported from LiteXML.</def></footnote-section>
</doc>`;
