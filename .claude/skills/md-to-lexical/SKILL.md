---
name: md-to-lexical
description: Convert Shiroi Markdown to Haklex Lexical JSON. Use when the user wants to convert a markdown file or string to rich text editor JSON format.
user_invocable: true
---

# Markdown to Lexical JSON Converter

Converts Shiroi-flavored Markdown to Haklex's Lexical `SerializedEditorState` JSON.

## Usage

Run the conversion script:

```bash
npx tsx scripts/md-to-lexical/index.ts <input.md> > output.json
```

Or pipe from stdin:

```bash
cat article.md | npx tsx scripts/md-to-lexical/index.ts - > output.json
```

## Supported Syntax

| Markdown                                       | Lexical Node                       |
| ---------------------------------------------- | ---------------------------------- | ---- | --------- | --- | ----------- |
| `# heading`                                    | HeadingNode                        |
| paragraph                                      | ParagraphNode                      |
| `> quote`                                      | QuoteNode                          |
| `> [!NOTE/TIP/WARNING/IMPORTANT/CAUTION]`      | AlertQuoteNode                     |
| `- list` / `1. list`                           | ListNode                           |
| `---`                                          | HorizontalRuleNode                 |
| ` ```lang ``` `                                | CodeBlockNode                      |
| ` ```mermaid ``` `                             | MermaidNode                        |
| `![alt](src "caption")`                        | ImageNode                          |
| `![alt](video.mp4)`                            | VideoNode (auto-detect)            |
| `<video src="...">`                            | VideoNode                          |
| `                                              | table                              | `    | TableNode |
| `$eq$`                                         | KaTeXInlineNode                    |
| `$$eq$$`                                       | KaTeXBlockNode                     |
| `**bold**`, `*italic*`, `~~strike~~`           | text format flags                  |
| `++underline++`, `==highlight==`               | text format flags                  |
| `^superscript^`, `~subscript~`                 | text format flags                  |
| `` `code` ``                                   | text format flag                   |
| `                                              |                                    | text |           | `   | SpoilerNode |
| `[name]{GH@handle}`                            | MentionNode                        |
| `[^id]` / `[^id]: ...`                         | FootnoteNode / FootnoteSectionNode |
| `<ruby>base<rt>reading</rt></ruby>`            | RubyNode                           |
| `<tag>text</tag>`                              | TagNode                            |
| `[text](url)`                                  | LinkNode                           |
| standalone URL paragraph                       | LinkCardNode                       |
| `:::gallery/carousel`                          | GalleryNode                        |
| `:::warn/info/error/banner`                    | BannerNode                         |
| `:::grid{cols=N,gap=M}`                        | GridContainerNode                  |
| `:::masonry`                                   | GalleryNode (masonry)              |
| `<details><summary>...</summary>...</details>` | DetailsNode                        |
| `<Tabs><tab label="...">code</tab>...</Tabs>`  | CodeSnippetNode                    |
| `<excalidraw>snapshot</excalidraw>`            | ExcalidrawNode                     |
| `<nested-doc>content</nested-doc>`             | NestedDocNode                      |

## Workflow

1. User provides a markdown file path or pastes markdown content
2. Run the script to generate JSON
3. Output can be saved to a file or used directly
