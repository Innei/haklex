# Mermaid renderer: loading UI + CLS prevention

**Date:** 2026-05-23
**Package:** `@haklex/rich-renderer-mermaid`
**Type:** Visual + UX fix

## Problem

The current loading state in `MermaidRenderer` has two defects:

1. **Source code leaks.** While mermaid is loading, the renderer mounts `<pre><code>{content}</code></pre>` — the raw diagram source is shown to readers. Long sources stretch the box and look like a broken page.
2. **Spinner position is wrong.** The spinner is a `::after` pseudo-element on the loading container, sitting inline-right of the source with `margin-left: 8px`. The whole `content + spinner` group is centered together, so the spinner drifts as content grows.
3. **Major CLS on render.** The loading box has `min-height: 80px`, but the real SVG is typically several hundred px tall. When loading resolves, the page jumps. `MermaidContainer` (success state) also has no min-height, so error → success and loading → success both shift.

## Goals

- No diagram source visible during loading.
- Spinner positioned predictably (vertical stack with a label).
- Loading, error, and success states share a single estimated height derived from the diagram source, so the rendered SVG slots into the same box and CLS = 0 in the common case.

## Non-goals

- Server-side mermaid rendering / SSR pre-measure.
- Persistent cross-session height cache (in-session memoization is unnecessary; estimate is cheap).
- i18n for the loading label (this package has no i18n machinery; English matches the existing `MermaidEditRenderer` copy).
- Skeleton shimmer animation (YAGNI; a labelled spinner is sufficient).
- Touching `useMermaidRender`, theme system, or SVG post-processing.
- Modifying `MermaidEditRenderer` (the editor surface has its own loading context).

## Scope

Modify three files in `packages/rich-renderer-mermaid/src/`:

- `MermaidRenderer.tsx` — rewrite the loading branch markup; thread estimated height through all three states.
- `styles.css.ts` — replace `mermaidLoading`'s inline spinner with a stacked layout + a dedicated `mermaidSpinner` class; drop the `::after` rule.
- `estimate-height.ts` — **new file**, pure function, no mermaid dependency.

Optionally:

- `__tests__/estimate-height.test.ts` — if the package already has a test harness. To be verified during implementation.

Consumer (`@yohaku/web`) requires no source change. After haklex publishes a new release, `apps/web/package.json` bumps the pinned version (per `Yohaku/CLAUDE.md` haklex integration notes).

## Design

### Height estimation (type-aware formula)

A pure function in `estimate-height.ts`:

```ts
export function estimateMermaidHeight(content: string): number {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'));

  const first = (lines[0] ?? '').toLowerCase();

  let h: number;
  if (first.startsWith('sequencediagram')) {
    h = lines.length * 50 + 60;
  } else if (first.startsWith('gantt')) {
    h = lines.length * 36 + 80;
  } else if (first.startsWith('pie')) {
    h = 320;
  } else if (
    first.startsWith('flowchart lr') ||
    first.startsWith('graph lr') ||
    first.startsWith('flowchart rl') ||
    first.startsWith('graph rl')
  ) {
    h = lines.length * 30 + 100;
  } else if (first.startsWith('classdiagram')) {
    h = lines.length * 40 + 100;
  } else if (first.startsWith('statediagram')) {
    h = lines.length * 50 + 80;
  } else if (first.startsWith('erdiagram')) {
    h = lines.length * 60 + 80;
  } else if (first.startsWith('journey')) {
    h = lines.length * 40 + 80;
  } else if (first.startsWith('mindmap')) {
    h = lines.length * 50 + 100;
  } else {
    // flowchart TD / graph TD / default / unknown
    h = lines.length * 60 + 80;
  }

  return Math.min(Math.max(Math.round(h), 200), 800);
}
```

- Strip blank lines and `%%` comment lines before counting.
- First non-blank line determines diagram type.
- Coefficients are heuristic; LR/RL is shorter than TD because horizontal layouts use width, not height.
- Clamp: `200 ≤ h ≤ 800`. The clamp prevents one-line diagrams from shrinking below something readable, and bounds the overestimate for very long sources (which often render shorter than line count would suggest).

### Renderer markup

`MermaidRenderer.tsx` is restructured so all three states share the same height:

```tsx
export const MermaidRenderer: FC<MermaidRendererProps & { colorScheme?: ColorScheme }> = ({
  content,
  colorScheme,
}) => {
  const { loading, error, imgSrc, width, height } = useMermaidRender(content, colorScheme);
  const minHeight = estimateMermaidHeight(content);
  const wrapperStyle = { minHeight };

  if (loading) {
    return (
      <div className={css.mermaidLoading} style={wrapperStyle}>
        <span className={css.mermaidSpinner} aria-hidden="true" />
        <span>Rendering diagram…</span>
      </div>
    );
  }

  if (!imgSrc) {
    return (
      <div className={css.mermaidError} style={wrapperStyle}>
        {error || 'Render failed'}
      </div>
    );
  }

  return (
    <div className={css.mermaidContainer} style={{ ...wrapperStyle, cursor: 'default' }}>
      <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
    </div>
  );
};
```

Notes:

- `min-height` is inline because the value is content-derived. The CSS rules in `styles.css.ts` no longer set a static `min-height`.
- `aria-hidden="true"` on the spinner — the textual label is the accessible name; the spinning ring is purely decorative.
- Cursor on `mermaidContainer` is preserved via the inline merge.

### Styles

`styles.css.ts` updates:

```ts
export const mermaidLoading = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  color: vars.color.textSecondary,
  fontSize: vars.typography.fontSizeMd,
  margin: '1rem 0',
});

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const mermaidSpinner = style({
  display: 'inline-block',
  width: 24,
  height: 24,
  border: '2.5px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
});

export const mermaidError = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  backgroundColor: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
  color: vars.color.alertCaution,
  fontSize: vars.typography.fontSizeMd,
  margin: '1rem 0',
});
```

Removed:

- `globalStyle(`${mermaidLoading}::after`, …)` — superseded by `mermaidSpinner` element.
- `mermaidLoading.minHeight: 80` — replaced by inline `min-height` (estimated).
- `mermaidError.minHeight: 50` — replaced by inline `min-height` (estimated).

Kept unchanged:

- `mermaidContainer` and its `globalStyle` `img` rule.
- All editor (`MermaidEditRenderer`) styles.

### CLS behavior

- Loading → success: same `min-height`. If real SVG ≤ estimate, SVG is centered in the box (extra whitespace). If real SVG > estimate, the box grows downward; this still pushes content below, but the loading-resolved transition itself has zero shift on the loading box's top edge — `min-height` is a floor, not a ceiling.
- Error → success / loading → error: same `min-height`.
- Estimate misses are bounded by clamp `[200, 800]`. Realistic worst case for typical blog diagrams: ±100 px from real height.

## Testing

If `packages/rich-renderer-mermaid` already has a vitest/jest setup, add `src/__tests__/estimate-height.test.ts`:

```ts
describe('estimateMermaidHeight', () => {
  it('clamps empty content to minimum', () => {
    expect(estimateMermaidHeight('')).toBe(200);
  });

  it('returns 320 for pie', () => {
    expect(estimateMermaidHeight('pie\n  "A": 50\n  "B": 50')).toBe(320);
  });

  it('LR is shorter than TD for same line count', () => {
    const td = estimateMermaidHeight('flowchart TD\nA-->B\nB-->C\nC-->D');
    const lr = estimateMermaidHeight('flowchart LR\nA-->B\nB-->C\nC-->D');
    expect(lr).toBeLessThan(td);
  });

  it('clamps to 800 for very long content', () => {
    const long = 'flowchart TD\n' + Array.from({ length: 30 }, (_, i) => `A${i}-->A${i + 1}`).join('\n');
    expect(estimateMermaidHeight(long)).toBe(800);
  });

  it('ignores comment lines', () => {
    const a = estimateMermaidHeight('flowchart TD\nA-->B');
    const b = estimateMermaidHeight('flowchart TD\n%% comment\n%% another\nA-->B');
    expect(a).toBe(b);
  });

  it('recognises sequenceDiagram', () => {
    const seq = estimateMermaidHeight('sequenceDiagram\nA->>B: hi\nB->>A: hello');
    expect(seq).toBeGreaterThan(200);
    expect(seq).toBeLessThan(400);
  });
});
```

If no test harness exists, implementation may skip this and add it as a follow-up.

Manual verification in a host app (Yohaku):

- Load a page with a known-large mermaid (flowchart TD with many nodes). Observe loading box ≈ final SVG height. No visible jump.
- Load a tiny mermaid (3 lines). Loading box should be 200 px floor.
- Load a sequence diagram. Loading box height should track real height within ±100 px.
- Force an error (invalid syntax). Error box should be the same height as loading was.

## Release / rollout

1. Implement changes in haklex.
2. Run package's `pnpm build` (or equivalent — confirm during implementation).
3. Bump version per haklex's release workflow.
4. Publish to npm.
5. In Yohaku, bump `apps/web/package.json` pin for `@haklex/rich-renderer-mermaid` (and any transitive consumers if they re-pin).
6. `pnpm install` and verify on `apps/web/src/components/modules/shared/Mermaid.tsx` page.

## Open questions

None remaining at design time. Verify the following during implementation:

- Whether `packages/rich-renderer-mermaid` has a test setup; if so wire the test file in.
- Whether vanilla-extract `style({})` requires any compile-time changes after introducing `mermaidSpinner`.
