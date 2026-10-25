import type { RichRendererProps } from '@haklex/rich-compose';
import { RichRenderer } from '@haklex/rich-compose';
import type { DiffHunk, InlineDiffBlockType } from '@haklex/rich-diff-core';
import { computeDiff, computeInlineDiff } from '@haklex/rich-diff-core';
import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { InlineSegment } from './inline-segments';
import { buildInlineSegments } from './inline-segments';
import * as diffStyles from './style.css';

export type RichDiffLayout = 'split' | 'inline';

export interface RichDiffProps {
  className?: string;
  collapseUnchanged?: boolean;
  extraNodes?: RichRendererProps['extraNodes'];
  layout?: RichDiffLayout;
  newValue: SerializedEditorState;
  oldValue: SerializedEditorState;
  renderCollapsed?: (count: number) => ReactNode;
  rendererConfig?: RichRendererProps['rendererConfig'];
  theme?: RichRendererProps['theme'];
  variant?: RichRendererProps['variant'];
}

interface DiffRow {
  left: DiffHunk | null;
  right: DiffHunk | null;
}

function buildRows(hunks: DiffHunk[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let i = 0;
  while (i < hunks.length) {
    const hunk = hunks[i];
    if (hunk.type === 'equal') {
      rows.push({ left: hunk, right: hunk });
      i++;
    } else {
      // Collect consecutive non-equal hunks into deletes/inserts
      const deletes: DiffHunk[] = [];
      const inserts: DiffHunk[] = [];
      while (i < hunks.length && hunks[i].type !== 'equal') {
        if (hunks[i].type === 'delete') deletes.push(hunks[i]);
        else inserts.push(hunks[i]);
        i++;
      }
      // Pair by position — surplus hunks render with empty opposite side
      const maxLen = Math.max(deletes.length, inserts.length);
      for (let k = 0; k < maxLen; k++) {
        rows.push({
          left: k < deletes.length ? deletes[k] : null,
          right: k < inserts.length ? inserts[k] : null,
        });
      }
    }
  }
  return rows;
}

function wrapDoc(nodes: SerializedLexicalNode[]): SerializedEditorState {
  return {
    root: {
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

type RendererProps = Pick<RichDiffProps, 'extraNodes' | 'rendererConfig' | 'theme' | 'variant'>;

function HunkRenderer({
  nodes,
  variant,
  theme,
  rendererConfig,
  extraNodes,
}: {
  nodes: SerializedLexicalNode[];
  variant?: RichRendererProps['variant'];
  theme?: RichRendererProps['theme'];
  rendererConfig?: RichRendererProps['rendererConfig'];
  extraNodes?: RichRendererProps['extraNodes'];
}) {
  const doc = useMemo(() => wrapDoc(nodes), [nodes]);
  return (
    <div className={diffStyles.diffCompact}>
      <RichRenderer
        nested
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={theme}
        value={doc}
        variant={variant}
      />
    </div>
  );
}

const segmentClass: Partial<Record<InlineDiffBlockType, string>> = {
  delete: diffStyles.delete_,
  insert: diffStyles.insert,
};

function defaultRenderCollapsed(count: number) {
  return `${count} unchanged`;
}

function InlineDiffBody({
  oldValue,
  newValue,
  collapseUnchanged,
  renderCollapsed,
  rendererProps,
}: {
  collapseUnchanged: boolean;
  newValue: SerializedEditorState;
  oldValue: SerializedEditorState;
  renderCollapsed: (count: number) => ReactNode;
  rendererProps: RendererProps;
}) {
  const blocks = useMemo(() => computeInlineDiff(oldValue, newValue), [oldValue, newValue]);
  const segments = useMemo<InlineSegment[]>(
    () => buildInlineSegments(blocks, { collapseUnchanged, context: 1 }),
    [blocks, collapseUnchanged],
  );

  return (
    <div className={diffStyles.body}>
      {segments.map((segment, i) =>
        segment.kind === 'collapsed' ? (
          <div className={diffStyles.collapsed} key={i}>
            {renderCollapsed(segment.count)}
          </div>
        ) : (
          <div
            className={`${diffStyles.inlineCell} ${segmentClass[segment.type] ?? ''}`.trim()}
            data-diff-type={segment.type}
            key={i}
          >
            <HunkRenderer nodes={segment.nodes} {...rendererProps} />
          </div>
        ),
      )}
    </div>
  );
}

function SplitDiffBody({
  oldValue,
  newValue,
  rendererProps,
}: {
  newValue: SerializedEditorState;
  oldValue: SerializedEditorState;
  rendererProps: RendererProps;
}) {
  const hunks = useMemo(() => computeDiff(oldValue, newValue), [oldValue, newValue]);
  const rows = useMemo(() => buildRows(hunks), [hunks]);

  return (
    <>
      <div className={diffStyles.header}>
        <div className={`${diffStyles.headerCell} ${diffStyles.headerOld}`}>Old</div>
        <div className={diffStyles.headerCell}>New</div>
      </div>
      <div className={diffStyles.body}>
        {rows.map((row, i) => (
          <div className={diffStyles.row} key={i}>
            <div
              className={`${diffStyles.cell} ${diffStyles.cellOld} ${
                row.left ? (row.left.type === 'delete' ? diffStyles.delete_ : '') : diffStyles.empty
              }`.trim()}
            >
              {row.left && <HunkRenderer nodes={row.left.nodes} {...rendererProps} />}
            </div>
            <div
              className={`${diffStyles.cell} ${
                row.right
                  ? row.right.type === 'insert'
                    ? diffStyles.insert
                    : ''
                  : diffStyles.empty
              }`.trim()}
            >
              {row.right && <HunkRenderer nodes={row.right.nodes} {...rendererProps} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function RichDiff({
  oldValue,
  newValue,
  variant = 'article',
  theme = 'light',
  layout = 'split',
  collapseUnchanged = false,
  renderCollapsed = defaultRenderCollapsed,
  rendererConfig,
  extraNodes,
  className,
}: RichDiffProps) {
  const rendererProps = { variant, theme, rendererConfig, extraNodes };
  const variantClass = getVariantClass(variant);

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <div className={variantClass} style={{ width: '100%', maxWidth: '100%' }}>
          <div className={`${diffStyles.root} ${className ?? ''}`.trim()}>
            {layout === 'inline' ? (
              <InlineDiffBody
                collapseUnchanged={collapseUnchanged}
                newValue={newValue}
                oldValue={oldValue}
                renderCollapsed={renderCollapsed}
                rendererProps={rendererProps}
              />
            ) : (
              <SplitDiffBody
                newValue={newValue}
                oldValue={oldValue}
                rendererProps={rendererProps}
              />
            )}
          </div>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
