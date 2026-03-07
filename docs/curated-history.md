# Curated history draft

## Intent

The public `main` branch should read like the evolution of a focused editor project, not like a dump from a larger monorepo.

To achieve that:

- keep real technical milestones
- split mixed commits by package or capability when possible
- drop repetitive release and version bump noise
- normalize package layout to `packages/*` from day one on curated history
- preserve a separate `raw-history` branch for provenance

## Curation rules

### Keep

- package bootstrapping
- architectural changes
- editor capabilities
- plugin and renderer extraction
- meaningful fixes
- namespace and packaging milestones that changed how the project is consumed

### Split

- commits that bundle demo + renderer + editor changes
- commits that mix UI primitives with editor behavior
- commits that combine feature work with release bumps

### Drop or squash

- pure version bumps
- pure dependency bumps
- repetitive release commits with no product-level change

## Proposed narrative arcs

### Arc 1: foundation

1. `feat(core): bootstrap rich editor package`
   - source: `6574b7d1`
   - scope: `rich-editor`

2. `feat(editor): add configurable renderer registry`
   - source: `b923ca3c`
   - scope: `rich-editor`

3. `feat(demo): move demo into a standalone workspace package`
   - source: `4fa618b1`
   - split from a larger mixed commit
   - scope: `rich-editor-demo`

### Arc 2: renderer ecosystem

4. `feat(renderer): add link card renderer package`
   - source: `4fa618b1`
   - split from a larger mixed commit
   - scope: `rich-renderer-linkcard`

5. `feat(renderer): add gallery renderer package`
   - source: `4fa618b1`
   - split from a larger mixed commit
   - scope: `rich-ext-gallery`
   - note: maps from early `rich-renderer-gallery`

6. `feat(editor): add markdown transformers for alert, footnote and task list nodes`
   - source: `fea81a7a`
   - scope: `rich-editor`

7. `feat(editor): add color scheme support and editing decorators`
   - source: `939eae44`
   - scope: `rich-editor`

8. `feat(mermaid): add diagram node and slash menu integration`
   - source: `614132fa`
   - scope: `rich-editor`, `rich-plugin-slash-menu`, `rich-renderer-mermaid`

9. `feat(editor): add tabs renderer improvements and icon support`
   - source: `598e6f6d`
   - scope: `rich-editor`

### Arc 3: UI and editing model

10. `feat(ui): extract dialog, menu and popover primitives`
   - source: `1c1c6263`
   - split from a larger mixed commit
   - scope: `rich-editor-ui`

11. `feat(alert): extract alert renderer and edit decorator`
   - source: `1c1c6263`
   - split from a larger mixed commit
   - scope: `rich-renderer-alert`, `rich-editor`

12. `feat(codeblock): extract standalone code block renderer`
    - source: `1c1c6263`
    - split from a larger mixed commit
    - scope: `rich-renderer-codeblock`, `rich-editor`

13. `feat(editor): separate edit and static rendering flows`
    - source: `1a4a6855`
    - scope: `rich-editor`, `rich-renderers`, related renderers

14. `feat(table): add table plugin and horizontal rule support`
    - source: `379e0d20`
    - scope: `rich-plugin-table`, `rich-editor`

15. `feat(toolbar): extract floating toolbar package`
    - source: `46919a99`
    - scope: `rich-plugin-floating-toolbar`, `rich-editor-ui`

### Arc 4: package split and runtime polish

16. `feat(core): split headless document model from React editor bindings`
    - source: `48fb6dc3`
    - scope: `rich-headless`, `rich-editor`

17. `feat(static): add static renderer and mention pipeline`
    - source: `c42b7b55`
    - scope: `rich-static-renderer`, `rich-plugin-mention`, `rich-renderer-mention`, `rich-renderers`

18. `feat(codeblock): migrate editor code blocks to CodeMirror 6`
    - source: `f58f6263`
    - scope: `cm-editor`, `rich-renderer-codeblock`, `rich-editor`

19. `feat(editor): add toolbar command registry`
    - source: `68d2af23`
    - scope: `rich-plugin-toolbar`, `rich-editor`

### Arc 5: advanced composition

20. `feat(editor): add nested document nodes and renderer hooks`
    - source: `1ce5642d`
    - scope: `rich-editor`, `rich-ext-nested-doc`, `rich-headless`

21. `feat(ext): integrate nested document workflows into the default kit`
    - source: `36315e72`
    - scope: `rich-ext-nested-doc`, `rich-renderers`, `rich-renderers-edit`, `rich-kit-shiro`

22. `feat(ui): add combobox primitives and modernize dropdown menus`
    - source: `75a425d3`
    - scope: `rich-editor-ui`, `rich-renderer-codeblock`, `rich-plugin-toolbar`, `rich-plugin-block-handle`, `rich-ext-code-snippet`

## High-value mixed commits to split manually

### `4fa618b1`

- demo package extraction
- link card renderer package
- gallery renderer package
- repo docs for renderer packages

### `1c1c6263`

- `rich-editor-ui` package bootstrap
- alert renderer extraction
- code block renderer extraction
- editor wiring for new decorators

### `1a4a6855`

- edit/static renderer separation
- package graph cleanup
- `rich-renderers` consolidation
- optional Shiro-specific kit work

### `b8a1f0a7`

- mobile bottom sheet for dialog system
- nested doc styling cleanup
- portal theme helpers
- version bump noise should be removed from curated history

### `92960038`

- remove read-only decorators
- mermaid renderer cleanup
- toolbar behavior refinements
- package bump noise should be removed from curated history

## First replay target

The first automated replay should only target the curated commits above, not the full `195`-commit raw stream.

That gives us a readable `main` branch quickly, while leaving room to backfill more granular commits later.
