/**
 * SVG post-processing pipeline inspired by beautiful-mermaid-playground.
 *
 * After mermaid renders SVG, this module injects visual overrides:
 *   - CSS custom property system for theming
 *   - "Soft" subgraph styling (subtle fills, font weights)
 *   - "Subtle" edge label styling (rounded bg, border)
 *   - Corner rounding ("soft" preset)
 *   - Consistent stroke widths and linecaps
 *
 * @see https://github.com/Justineo/beautiful-mermaid-playground
 */

import type { ThemeTokens } from './mermaid-theme';

// Corner radius presets (matching beautiful-mermaid's "soft" preset)
const CORNER_RADIUS = {
  node: 5,
  classNode: 4,
  entity: 5,
  subgraphOuter: 7,
  subgraphHeader: 6,
  actor: 6,
  activation: 4,
  diamond: 4,
} as const;

/**
 * Convert node <polygon> elements to <path> with rounded corners.
 * Handles diamonds (4pt), hexagons (6pt), asymmetric (5pt), etc.
 * Each corner is replaced by a quadratic bezier curve.
 */
function roundNodePolygons(doc: Document, radius: number): void {
  const polygons = doc.querySelectorAll<SVGPolygonElement>('.node > polygon, .node polygon');
  for (const polygon of polygons) {
    const points = polygon.points;
    if (points.numberOfItems < 3) continue;

    const pts: [number, number][] = [];
    for (let i = 0; i < points.numberOfItems; i++) {
      const p = points.getItem(i);
      pts.push([p.x, p.y]);
    }

    const d = pts
      .map((pt, i) => {
        const prev = pts[(i + pts.length - 1) % pts.length];
        const next = pts[(i + 1) % pts.length];

        const dx1 = prev[0] - pt[0];
        const dy1 = prev[1] - pt[1];
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const dx2 = next[0] - pt[0];
        const dy2 = next[1] - pt[1];
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        const r = Math.min(radius, len1 / 2, len2 / 2);

        const startX = pt[0] + (dx1 / len1) * r;
        const startY = pt[1] + (dy1 / len1) * r;
        const endX = pt[0] + (dx2 / len2) * r;
        const endY = pt[1] + (dy2 / len2) * r;

        const moveOrLine = i === 0 ? 'M' : 'L';
        return `${moveOrLine}${startX},${startY} Q${pt[0]},${pt[1]} ${endX},${endY}`;
      })
      .join(' ');

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `${d} Z`);

    // Copy attributes from polygon
    for (const attr of Array.from(polygon.attributes)) {
      if (attr.name !== 'points') {
        path.setAttribute(attr.name, attr.value);
      }
    }

    polygon.replaceWith(path);
  }
}

function applyCornerRounding(doc: Document): void {
  const applyRadius = (selector: string, radius: number) => {
    const rects = doc.querySelectorAll<SVGRectElement>(selector);
    for (const rect of rects) {
      rect.setAttribute('rx', String(radius));
      rect.setAttribute('ry', String(radius));
    }
  };

  // Flowchart nodes
  applyRadius('.node > rect', CORNER_RADIUS.node);
  applyRadius('.node > .basic', CORNER_RADIUS.node);

  // Class diagram nodes
  applyRadius('.classGroup > rect', CORNER_RADIUS.classNode);

  // ER diagram entities
  applyRadius('.er > rect', CORNER_RADIUS.entity);

  // Subgraph/cluster
  applyRadius('.cluster > rect', CORNER_RADIUS.subgraphOuter);

  // Sequence diagram actors
  applyRadius('.actor', CORNER_RADIUS.actor);

  // Activations
  applyRadius('.activation0, .activation1, .activation2', CORNER_RADIUS.activation);

  // Polygon nodes (diamond, hexagon, etc.) — convert to rounded path
  roundNodePolygons(doc, CORNER_RADIUS.diamond);
}

function buildVisualCss(tokens: ThemeTokens): string {
  return `
    /* beautiful-mermaid inspired visual overrides */

    /* Edge styling: rounded linecaps for clean connections */
    .edgePath path.path,
    .flowchart-link,
    line[class*="messageLine"] {
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }

    /* Cluster/subgraph "soft" styling */
    .cluster > rect {
      fill: ${tokens.nodeFill} !important;
      fill-opacity: 0.96 !important;
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
    }

    /* Cluster title */
    .cluster text,
    .cluster .nodeLabel {
      fill: ${tokens.textSec} !important;
    }

    /* Node stroke consistency */
    .node rect,
    .node circle,
    .node ellipse,
    .node polygon,
    .node .basic {
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
    }

    /* Node fill */
    .node rect,
    .node .basic {
      fill: ${tokens.nodeFill} !important;
    }

    /* Edge label "subtle" styling */
    .edgeLabel rect,
    .labelBkg {
      rx: 5 !important;
      ry: 5 !important;
      fill: ${tokens.bg} !important;
      stroke: ${tokens.innerStroke} !important;
      stroke-width: 1px !important;
    }

    .edgeLabel text,
    .edgeLabel .edgeLabel {
      fill: ${tokens.textMuted} !important;
    }

    /* Arrow heads */
    marker path {
      fill: ${tokens.arrow} !important;
      stroke: ${tokens.arrow} !important;
    }

    /* Edge paths */
    .edgePath path.path {
      stroke: ${tokens.line} !important;
      stroke-width: 1px !important;
    }

    /* Sequence diagram refinements */
    .actor {
      fill: ${tokens.nodeFill} !important;
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
    }

    .messageLine0,
    .messageLine1 {
      stroke: ${tokens.line} !important;
      stroke-width: 1px !important;
    }

    .messageText {
      fill: ${tokens.fg} !important;
    }

    .loopLine {
      stroke: ${tokens.innerStroke} !important;
      stroke-width: 1px !important;
    }

    .labelBox {
      fill: ${tokens.nodeFill} !important;
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
    }

    .loopText tspan,
    .loopText {
      fill: ${tokens.textSec} !important;
    }

    /* Activation bars */
    .activation0,
    .activation1,
    .activation2 {
      fill: ${tokens.innerStroke} !important;
      stroke: ${tokens.line} !important;
    }

    /* Note styling */
    .note {
      fill: ${tokens.nodeFill} !important;
      stroke: ${tokens.innerStroke} !important;
    }

    .noteText {
      fill: ${tokens.fg} !important;
    }

    /* Inner divider lines */
    .divider {
      stroke: ${tokens.innerStroke} !important;
      stroke-width: 0.75px !important;
    }

    /* Class diagram */
    .classGroup rect {
      fill: ${tokens.nodeFill} !important;
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
    }

    .classGroup line {
      stroke: ${tokens.innerStroke} !important;
      stroke-width: 0.75px !important;
    }

    .classGroup text {
      fill: ${tokens.fg} !important;
    }

    .classLabel .box {
      fill: ${tokens.groupHeader} !important;
      stroke: ${tokens.nodeStroke} !important;
    }

    .relation {
      stroke: ${tokens.line} !important;
      stroke-width: 1px !important;
    }

    /* State diagram */
    .stateGroup rect,
    .statediagram-state rect {
      fill: ${tokens.nodeFill} !important;
      stroke: ${tokens.nodeStroke} !important;
      stroke-width: 1px !important;
      rx: 5 !important;
      ry: 5 !important;
    }

    .stateGroup text {
      fill: ${tokens.fg} !important;
    }

    /* Git graph */
    .commit-id text {
      fill: ${tokens.textMuted} !important;
    }

  `;
}

export function postProcessMermaidSvg(svg: string, tokens: ThemeTokens): string {
  // Mermaid emits unclosed `<br>` inside <foreignObject> labels (HTML void
  // form). DOMPurify undoes mermaid's own `<br/>` cleanup, leaving an SVG
  // string that fails strict XML parsing — both for our DOMParser below and
  // later when the SVG is rendered via `data:image/svg+xml`. Normalize once
  // so post-processing applies and the data URI <img> renders.
  const normalizedSvg = svg.replaceAll(/<br\s*>/gi, '<br/>');

  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizedSvg, 'image/svg+xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) return normalizedSvg;

  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'svg') return normalizedSvg;

  // 1. Apply corner rounding
  applyCornerRounding(doc);

  // Pin intrinsic dimensions from the viewBox. Mermaid emits `width="100%"`,
  // which collapses an `<img>`'s naturalWidth to the 300px UA default — the
  // image preview lightbox then displays a thumbnail-sized SVG instead of the
  // full-resolution diagram. Promoting viewBox to explicit pixel attrs makes
  // the preview match the diagram's true size while still scaling responsively
  // through CSS in the host container.
  const viewBox = root.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      root.setAttribute('width', String(parts[2]));
      root.setAttribute('height', String(parts[3]));
    }
  }

  // 2. Inject visual CSS overrides
  const existingOverride = root.querySelector('style[data-visual-overrides]');
  existingOverride?.remove();

  const styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.dataset.visualOverrides = '';
  styleEl.textContent = buildVisualCss(tokens);

  // Insert style as first child for proper cascade
  if (root.firstChild) {
    root.insertBefore(styleEl, root.firstChild);
  } else {
    root.append(styleEl);
  }

  return new XMLSerializer().serializeToString(root);
}
