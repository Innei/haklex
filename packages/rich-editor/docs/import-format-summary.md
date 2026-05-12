# Haklex Import Formats

本文档约定编辑器导入侧的格式边界：Markdown 原生支持的结构继续使用 Markdown；Markdown 不存在稳定语义的 Haklex 扩展节点统一使用 LiteXML。

面向 AI Agent 的生成规则见 [Markdown Flavor LiteXML](./markdown-flavor-litexml.md)。

## Import Surfaces

| Surface  | Direction                           | Entry                                      |
| -------- | ----------------------------------- | ------------------------------------------ |
| Markdown | Markdown -> Lexical                 | `MarkdownPastePlugin` + `ALL_TRANSFORMERS` |
| LiteXML  | LiteXML -> Lexical serialized nodes | `@haklex/rich-litexml` default registry    |

## Rule

| Node class                                         | Import format |
| -------------------------------------------------- | ------------- |
| CommonMark-compatible blocks and inline marks      | Markdown      |
| Haklex-only decorators and semantic containers     | LiteXML       |
| Ambiguous structures where Markdown would be lossy | LiteXML       |

## LiteXML Tags

| Lexical node       | LiteXML import                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `image`            | `<img src="/a.jpg" alt="A" caption="Caption" />`                                               |
| `video`            | `<video src="/clip.mp4" poster="/thumb.jpg" />`                                                |
| `link-card`        | `<link-card url="https://example.com" title="Example" />`                                      |
| `embed`            | `<embed url="https://example.com" source="..." />`                                             |
| `code-block`       | `<codeblock lang="ts">const x = 1</codeblock>`                                                 |
| `mermaid`          | `<mermaid>graph LR</mermaid>`                                                                  |
| `katex-block`      | `<math display="block">E=mc^2</math>`                                                          |
| `katex-inline`     | `<math>E=mc^2</math>`                                                                          |
| `alert-quote`      | `<alert type="warning"><p>Content</p></alert>`                                                 |
| `banner`           | `<banner type="tip"><p>Content</p></banner>`                                                   |
| `nested-doc`       | `<nested-doc><p>Content</p></nested-doc>`                                                      |
| `details`          | `<details summary="More" open="true"><p>Content</p></details>`                                 |
| `spoiler`          | `<spoiler>Hidden</spoiler>`                                                                    |
| `ruby`             | `<ruby rt="reading">Base</ruby>`                                                               |
| `mention`          | `<mention platform="github" handle="innei">Innei</mention>`                                    |
| `tag`              | `<tag>AI</tag>`                                                                                |
| `comment`          | `<comment>Note</comment>`                                                                      |
| `footnote`         | `<footnote ref="1" />`                                                                         |
| `footnote-section` | `<footnote-section><def ref="1">Definition</def></footnote-section>`                           |
| `gallery`          | `<gallery layout="grid"><img src="/a.jpg" alt="A" /></gallery>`                                |
| `excalidraw`       | `<excalidraw><![CDATA[{"elements":[]}]]></excalidraw>`                                         |
| `grid-container`   | `<grid cols="2" gap="16px"><cell><p>A</p></cell><cell><p>B</p></cell></grid>`                  |
| `agent-diff`       | `<agent-diff op="insert" entry="diff-1" />`                                                    |
| `code-snippet`     | `<code-snippet><file name="index.ts" lang="ts">export {}</file></code-snippet>`                |
| `chat`             | `<chat variant="user-agent"><participants>...</participants><messages>...</messages></chat>`   |
| `poll`             | `<poll mode="single"><question>Pick one</question><option>A</option><option>B</option></poll>` |

## Notes

- `id` on block-level LiteXML elements maps to `blockId`.
- `poll-id` and option `id` are optional for fresh poll creation; the reader mints IDs when omitted.
- Extension nodes still require their corresponding Lexical node classes to be registered in the editor.
