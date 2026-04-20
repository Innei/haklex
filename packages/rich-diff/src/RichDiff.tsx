import type { DiffHunk } from '@haklex/rich-diff-core';
import { computeDiff } from '@haklex/rich-diff-core';
import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import type { RichRendererProps } from '@haklex/rich-static-renderer';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { useMemo } from 'react';

import * as diffStyles from './style.css';

export interface RichDiffProps {
  className?: string;
  extraNodes?: RichRendererProps['extraNodes'];
  newValue: SerializedEditorState;
  oldValue: SerializedEditorState;
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

function HunkRenderer({
  hunk,
  variant,
  theme,
  rendererConfig,
  extraNodes,
}: {
  hunk: DiffHunk;
  variant?: RichRendererProps['variant'];
  theme?: RichRendererProps['theme'];
  rendererConfig?: RichRendererProps['rendererConfig'];
  extraNodes?: RichRendererProps['extraNodes'];
}) {
  const doc = useMemo(() => wrapDoc(hunk.nodes), [hunk.nodes]);
  return (
    <div className={diffStyles.diffCompact}>
      <RichRenderer
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={theme}
        value={doc}
        variant={variant}
      />
    </div>
  );
}

export function RichDiff({
  oldValue,
  newValue,
  variant = 'article',
  theme = 'light',
  rendererConfig,
  extraNodes,
  className,
}: RichDiffProps) {
  const hunks = useMemo(() => computeDiff(oldValue, newValue), [oldValue, newValue]);
  const rows = useMemo(() => buildRows(hunks), [hunks]);

  const rendererProps = { variant, theme, rendererConfig, extraNodes };
  const variantClass = getVariantClass(variant);

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <div className={variantClass} style={{ width: '100%', maxWidth: '100%' }}>
          <div className={`${diffStyles.root} ${className ?? ''}`.trim()}>
            <div className={diffStyles.header}>
              <div className={`${diffStyles.headerCell} ${diffStyles.headerOld}`}>Old</div>
              <div className={diffStyles.headerCell}>New</div>
            </div>
            <div className={diffStyles.body}>
              {rows.map((row, i) => (
                <div className={diffStyles.row} key={i}>
                  <div
                    className={`${diffStyles.cell} ${diffStyles.cellOld} ${
                      row.left
                        ? row.left.type === 'delete'
                          ? diffStyles.delete_
                          : ''
                        : diffStyles.empty
                    }`.trim()}
                  >
                    {row.left && <HunkRenderer hunk={row.left} {...rendererProps} />}
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
                    {row.right && <HunkRenderer hunk={row.right} {...rendererProps} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
