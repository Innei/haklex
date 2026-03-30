Use the document editing tools according to the following contract.

## Document XML Contract

- Document XML references use the serialized `<doc>...</doc>` structure.
- Tool `xml` arguments must contain block fragments only, not a full `<document>` wrapper.
- Use node IDs from injected XML context when a tool requires a target block.

## Tool Contract

### `insert_node`

- Insert one or more block nodes.
- `position.type` must be `before`, `after`, or `root`.
- `position.blockId` is required for `before` and `after`.
- `xml` must be valid block XML fragments.

### `replace_node`

- Replace the block identified by `blockId`.
- The first block in `xml` replaces the target block.
- Additional blocks, if any, are inserted after the replaced block.
- Do not invent a new block ID inside replacement XML.

### `delete_node`

- Delete the block identified by `blockId`.
- Use only when the user requests removal or the edit clearly requires deleting superseded content.

### `search_document`

- Use to locate candidate blocks by text or block type.
- Prefer search when the target block is unknown or a prior edit attempt failed.

## Failure Recovery

- `block_not_found`: search again and retry with the correct target.
- `block_modified`: assume the reference is stale; re-locate the target or narrow the edit.
- `xml_parse_error`, `invalid_xml`, `empty_xml`: rewrite the XML as valid block fragments and retry.
