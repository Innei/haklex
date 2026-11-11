# Whiteboard scene format

The whiteboard stores one Excalidraw-shaped scene as JSON. This page is the reference for writing that JSON by hand or from an AI agent. Everything the editor and the read-only renderer understand is listed here; fields not listed are kept as they are but ignored.

Boards that use `shadow`, `svg` or `richtext` render correctly here but not on excalidraw.com.

## Scene

```json
{
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": 20 },
  "elements": [],
  "files": {},
  "source": "my-agent",
  "type": "excalidraw",
  "version": 2
}
```

- `elements` are drawn in array order: later elements sit on top.
- `appState.gridSize` (number or `null`) turns grid snapping on in the editor.
- `files` holds image data for `image` elements, keyed by `fileId`. `svg` elements do not use it.

## Fields every element has

| Field             | Type                                        | Notes                                                                       |
| ----------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `id`              | string                                      | Unique in the scene.                                                        |
| `type`            | string                                      | One of the types below.                                                     |
| `x`, `y`          | number                                      | Top-left corner in scene pixels.                                            |
| `width`, `height` | number                                      | Size in scene pixels.                                                       |
| `angle`           | number                                      | Rotation in radians around the centre. Default `0`.                         |
| `strokeColor`     | string                                      | Outline or text colour. `"transparent"` hides it.                           |
| `backgroundColor` | string                                      | Fill colour. `"transparent"` for none.                                      |
| `fillStyle`       | `"solid"` \| `"hachure"` \| `"cross-hatch"` | Use `"solid"` for flat fills.                                               |
| `strokeWidth`     | number                                      | `1`, `2` or `4`.                                                            |
| `strokeStyle`     | `"solid"` \| `"dashed"` \| `"dotted"`       |                                                                             |
| `roughness`       | number                                      | `0` clean lines, `1` hand-drawn, `2` very sketchy.                          |
| `roundness`       | `{ "type": 3 }` \| `null`                   | Rounded corners for rectangles and cards; `{ "type": 2 }` for curved lines. |
| `opacity`         | number                                      | `0`–`100`.                                                                  |
| `shadow`          | boolean                                     | Soft drop shadow. See below.                                                |
| `groupIds`        | string[]                                    | Elements sharing an id move together.                                       |
| `frameId`         | string \| null                              | The frame this element belongs to.                                          |
| `locked`          | boolean                                     | Locked elements can't be selected or edited.                                |
| `seed`            | number                                      | Random seed for hand-drawn lines; any integer.                              |

Missing fields get defaults when the board loads, so a minimal element only needs `id`, `type`, `x`, `y`, `width` and `height`.

## Clean style

New shapes drawn by hand default to the hand-drawn look. For a clean, modern board write these on each element:

- `"roughness": 0` for straight lines and even fills;
- `"fontFamily": 2` on `text` for a sans-serif font (`5` is the handwritten default, `3` is monospace);
- `"fillStyle": "solid"` for flat colour.

## Element types

### `rectangle`, `ellipse`, `diamond`

Basic shapes. Use `backgroundColor` with `"fillStyle": "solid"` for a coloured area, and `roundness: { "type": 3 }` for rounded rectangles.

### `line`, `arrow`

```json
{
  "endArrowhead": "arrow",
  "height": 0,
  "points": [
    [0, 0],
    [200, 0]
  ],
  "startArrowhead": null,
  "type": "arrow",
  "width": 200,
  "x": 100,
  "y": 100
}
```

- `points` are relative to `x`, `y`; the first is usually `[0, 0]`.
- Arrowheads: `"arrow"`, `"triangle"`, `"dot"`, `"bar"`, `"circle"`, `"diamond"` (and `_outline` variants), or `null`.
- `"elbowed": true` routes the arrow at right angles around shapes.
- To attach an arrow to a shape, set `startBinding` / `endBinding` to `{ "elementId": "<shape id>", "focus": 0, "gap": 4 }` and add `{ "id": "<arrow id>", "type": "arrow" }` to the shape's `boundElements`. Shapes that accept arrows: rectangle, ellipse, diamond, text, image, svg, richtext.

### `freedraw`

A pen stroke: `points` relative to `x`, `y`, `"pressures": []`, `"simulatePressure": true`. Good for underlines and scribbles.

### `text`

```json
{
  "fontFamily": 2,
  "fontSize": 44,
  "strokeColor": "#1e1e1e",
  "text": "A very hot hot sauce",
  "textAlign": "left",
  "type": "text",
  "verticalAlign": "top"
}
```

One style per element. `width` and `height` are recalculated from the text when the board is edited; write an estimate. For text with several styles use a `richtext` card.

### `image`

`fileId` points into `files`, whose entry has `dataURL` and `mimeType`. Prefer `svg` for illustrations an agent draws.

### `frame`

A named container: `"name": "Week 1"`. Elements with a matching `frameId` are clipped to it.

### `svg`

An illustration written as SVG source.

```json
{
  "angle": 0.15,
  "height": 100,
  "id": "bottle",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 100\">…</svg>",
  "type": "svg",
  "width": 48,
  "x": 820,
  "y": 30
}
```

- The source is drawn as an image fitted inside `width` × `height`, keeping its aspect ratio. Give the root a `viewBox`.
- It runs no scripts and loads nothing external: inline every shape and colour. Text inside the SVG uses system fonts, not the page's.
- Dark mode does not invert it.
- People can move, resize, rotate, fade, shadow and delete it, but not edit inside it. To change the drawing, rewrite `svg`.
- An empty or invalid `svg` shows a dashed placeholder.

### `richtext`

A card holding a small rich-text document: sticky notes, labelled cards, short lists.

```json
{
  "backgroundColor": "#f3c4d8",
  "content": {
    "root": {
      "type": "root",
      "children": [
        { "type": "heading", "tag": "h3", "children": [{ "type": "text", "text": "Brew" }] },
        {
          "type": "paragraph",
          "children": [{ "type": "text", "text": "Mila", "style": "color: #6b6b6b" }]
        }
      ]
    }
  },
  "fillStyle": "solid",
  "height": 96,
  "id": "card-brew",
  "roughness": 0,
  "roundness": { "type": 3 },
  "shadow": true,
  "strokeColor": "transparent",
  "strokeWidth": 1,
  "type": "richtext",
  "width": 150,
  "x": 60,
  "y": 280
}
```

- The card body uses the element's own `backgroundColor`, border (`strokeColor`, `strokeWidth`, `strokeStyle`, `roughness`), `roundness`, `shadow` and `opacity`. Defaults: yellow `#ffec99`, no border, clean, rounded.
- `content` is a Lexical editor state. Supported nodes:
  - blocks: `paragraph`, `heading` (`tag` `h1`–`h6`), `quote`, `list` (`listType` `"bullet"` or `"number"`) holding `listitem`s;
  - inline: `text`, `linebreak`, `link` (`url`, http/https/mailto only).
- `text.format` is a bit mask: `1` bold, `2` italic, `4` strikethrough, `8` underline, `16` inline code, `128` highlight. `text.style` takes `color: …` and `background-color: …`.
- Other node types keep their data but show only their text, and become plain text once a person edits the card.
- Content has 12px padding. Body text is 16px with 24px lines; `h1` 26px, `h2` 22px, `h3` 18px, all in a sans-serif font.
- **Height:** `width` is fixed and content wraps inside it. `height` is a minimum: if the content needs more room, the card grows when the board loads, in the editor and in the article alike. Give cards in one row the same `height` to line them up. Cards never shrink on their own.
- People edit the text in place (double-click or Enter) with a format bar for bold, italic, strikethrough, code, highlight, colour, heading, lists and links.

## Shadow

`"shadow": true` adds one soft drop shadow under rectangles, ellipses, diamonds, images, `svg` and `richtext`. It stays dark in dark mode and does not change the element's size or hit area. Other element types ignore it.

## Dark mode

The read-only view and the editor invert the whole drawing in dark mode, so write colours for a light background. Images and `svg` elements keep their own colours.

## Example

`src/acceptance/brainstorm-board.ts` builds a complete board with a title, a hand-drawn underline, an `svg` sticker, a coloured area, a five-day timeline and six `richtext` cards with shadows.
