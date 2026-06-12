# @haklex/rich-litexml

Bidirectional Lexical editor state ↔ XML serialization for LLM-friendly document I/O. Converts Lexical `SerializedEditorState` to a compact, token-efficient XML format and back again — enabling AI agents to read and write structured rich text documents with minimal token overhead.

## Installation

```bash
pnpm add @haklex/rich-litexml
```

## Peer Dependencies

| Package   | Version   |
| --------- | --------- |
| `lexical` | `^0.45.0` |

## Usage

### Serialize editor state to XML

```ts
import { serializeToXml } from '@haklex/rich-litexml';

const xml = serializeToXml(serializedEditorState);
// '<root><p>Hello <strong>world</strong></p><img src="..." /></root>'
```

### Deserialize XML to editor state

```ts
import { deserializeFromXml } from '@haklex/rich-litexml';

const editorState = deserializeFromXml(xmlString);
```

### Register custom node types

```ts
import { LitexmlRegistry } from '@haklex/rich-litexml';
import { registerBuiltinReaders, registerCustomReaders } from '@haklex/rich-litexml';
import { registerBuiltinWriters, registerCustomWriters } from '@haklex/rich-litexml';

const registry = new LitexmlRegistry();
registerBuiltinReaders(registry);
registerBuiltinWriters(registry);

// Add custom node readers/writers
registerCustomReaders(registry, [myReader]);
registerCustomWriters(registry, [myWriter]);
```

## Exports

### Serialization

| Export                                 | Description                                      |
| -------------------------------------- | ------------------------------------------------ |
| `serializeToXml(state, options?)`      | Convert `SerializedEditorState` to XML string    |
| `serializeNodesToXml(nodes, options?)` | Convert an array of serialized nodes to XML      |
| `deserializeFromXml(xml)`              | Convert an XML string to `SerializedEditorState` |
| `deserializeNodesFromXml(xml)`         | Convert an XML string to serialized nodes array  |

### Registry

| Export                                     | Description                                           |
| ------------------------------------------ | ----------------------------------------------------- |
| `LitexmlRegistry`                          | Plugin registry class for custom node readers/writers |
| `createDefaultRegistry()`                  | Create a registry pre-populated with builtins         |
| `registerBuiltinReaders(registry)`         | Register builtin XML → node readers                   |
| `registerBuiltinWriters(registry)`         | Register builtin node → XML writers                   |
| `registerCustomReaders(registry, readers)` | Register custom readers                               |
| `registerCustomWriters(registry, writers)` | Register custom writers                               |

### Types

| Export                          | Description                                |
| ------------------------------- | ------------------------------------------ |
| `XmlSerializerOptions`          | Options for XML serialization              |
| `LitexmlNodeReader`             | Reader interface for XML → node conversion |
| `LitexmlNodeWriter`             | Writer interface for node → XML conversion |
| `XmlNodeData`, `XmlNodeElement` | XML AST types                              |
| `XmlRenderOptions`              | Rendering style options for XML output     |

### Sub-path Exports

| Import Path            | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `@haklex/rich-litexml` | Full exports (browser or Node.js, auto-selected) |

The package selects between browser and Node.js entry points automatically: Node.js uses `linkedom` for HTML parsing, while the browser entry uses the native `DOMParser`.

---

> **Note:** LiteXML is XML-based, not a custom DSL. The compact tag vocabulary minimizes token count for LLM consumption. For AI agent integration, see `@haklex/rich-agent-core`.

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
