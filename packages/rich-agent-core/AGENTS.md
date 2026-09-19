# @haklex/rich-agent-core

AI agent execution engine for the rich editor. Provides tool definitions, message pipeline, and executor loop.

## Dependencies

- `@haklex/rich-litexml` — XML serialization for document context and tool parameters
- When adding new node types, they MUST also be registered in `rich-litexml`

## Architecture

- `agent-executor.ts` — Main loop: sends messages to LLM, executes tool calls, collects operations
- `document-tools.ts` — Built-in tools (insert_node, replace_node, delete_node, search_document)
- `pipeline.ts` — Builds document context as XML via rich-litexml
- `snapshot.ts` — Immutable snapshot of editor state for tool validation

## Tool Parameters

- `insert_node` and `replace_node` accept an `xml` string parameter (not raw Lexical JSON)
- The XML is deserialized via `@haklex/rich-litexml` into SerializedLexicalNode(s)
- `delete_node` and `search_document` operate by blockId

## System Prompt

The default system prompt lives in `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`.
When new XML tags are added to rich-litexml, update the system prompt's element reference list.
