import { RendererWrapper } from '@haklex/rich-editor/static';
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import type { NodeKey } from 'lexical';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChartBlockRenderer } from './ChartBlockRenderer';
import type { ChartViewMode } from './ChartView';
import { ChartRenderer } from './ChartView';
import * as s from './edit.css';
import type { ChartSlotProps } from './slot';
import { CHART_NODE_KEY } from './slot';
import { parseChartSource } from './validate';

export interface ChartEditRendererProps extends ChartSlotProps {
  nodeKey: NodeKey;
}

export function ChartEditRenderer(props: ChartEditRendererProps) {
  const isEditable = useLexicalEditable();
  if (!isEditable) {
    return (
      <RendererWrapper
        defaultRenderer={ChartBlockRenderer}
        props={{ spec: props.spec }}
        rendererKey={CHART_NODE_KEY}
      />
    );
  }
  return <ChartEditRendererInner {...props} />;
}

function formatRawSpec(spec: string): string {
  try {
    return JSON.stringify(JSON.parse(spec), null, 2);
  } catch {
    return spec;
  }
}

const stopPropagation = (event: MouseEvent) => event.stopPropagation();

function ChartEditRendererInner({ spec, nodeKey }: ChartEditRendererProps) {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [view, setView] = useState<ChartViewMode>('chart');
  const [rawOpen, setRawOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isValid = useMemo(() => parseChartSource(spec).ok, [spec]);
  const rawText = useMemo(() => formatRawSpec(spec), [spec]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleSelect = useCallback(
    (event: MouseEvent) => {
      if (!event.shiftKey) clearSelection();
      setSelected(true);
    },
    [clearSelection, setSelected],
  );

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(spec)
      .then(() => setCopied(true))
      .catch(() => {});
  }, [spec]);

  const showToolbar = isSelected || rawOpen;

  return (
    <div className={`${s.frame}${isSelected ? ` ${s.frameSelected}` : ''}`} onClick={handleSelect}>
      <ChartRenderer hideToggle defaultView={view} key={view} value={spec} />
      {showToolbar && (
        <div className={s.toolbar} onClick={stopPropagation}>
          {isValid && (
            <button
              aria-pressed={view === 'table'}
              className={s.toolbarButton}
              type="button"
              onClick={() => setView(view === 'table' ? 'chart' : 'table')}
            >
              {view === 'table' ? 'View chart' : 'View data'}
            </button>
          )}
          <Popover open={rawOpen} onOpenChange={setRawOpen}>
            <PopoverTrigger className={s.toolbarButton}>Raw data</PopoverTrigger>
            <PopoverPanel align="end" className={s.rawPanel} side="bottom" sideOffset={6}>
              <div className={s.rawHead}>
                <span>Chart spec (read-only)</span>
                <button className={s.toolbarButton} type="button" onClick={handleCopy}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className={s.rawCode}>
                {rawText || <span className={s.rawEmpty}>(empty)</span>}
              </pre>
            </PopoverPanel>
          </Popover>
        </div>
      )}
    </div>
  );
}
