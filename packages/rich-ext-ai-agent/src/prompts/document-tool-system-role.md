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

## Node-Specific Guidance

### `<poll>` (interactive vote widget)

- Shape: `<poll mode="single|multiple" [poll-id="..."] [close-at="ISO8601"] [show-results="always|after-vote|after-close"]><question>...</question><option [id="..."]>...</option>...</poll>`
- When **creating** a new poll, omit `poll-id` and `option id` attributes — the system mints stable IDs.
- When **editing** an existing poll, preserve `poll-id` and existing `option id`s. Adding a new option without an `id` mints a new one. Removing an option deletes its tally permanently.
- Minimum 2 options. `mode` defaults to `single`. Question is plain text (no inline formatting).

## Failure Recovery

- `block_not_found`: search again and retry with the correct target.
- `block_modified`: assume the reference is stale; re-locate the target or narrow the edit.
- `xml_parse_error`, `invalid_xml`, `empty_xml`: rewrite the XML as valid block fragments and retry.

## Selection Context

The system may inject selection context when the user has an active selection in the editor.

### Block Selection

When the user has selected entire blocks, those blocks appear in the document XML with a `selected="true"` attribute. The user's request likely pertains to these blocks. Use the block IDs from the selected blocks when performing edits.

### Text Selection

When the user has selected a text range, a `<text_selection>` section is injected containing:

- `<selected_text>`: the exact text the user highlighted
- `<anchor>` and `<focus>`: the start and end points of the selection, with `blockId` and character `offset` within that block
- `<containing_blocks>`: the full XML of the block(s) that contain the selection

When editing in response to a text selection, use `replace_node` on the containing block, preserving content outside the selection range while modifying the selected portion.
